import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
type Word = {
  id: number | string;
  word: string;
  meaning: string;
};

interface BookmarkState {
  bookmarks: Word[];
  isLoading: boolean;
  loadingError: string | null;

  // Methods
  addBookmark: (word: Word) => void;
  removeBookmark: (wordId: number | string) => void;
  isBookmarked: (wordId: number | string) => boolean;
  loadBookmarks: () => Promise<void>;
  retryLoading: () => Promise<void>;
  clearAllBookmarks: () => Promise<void>;
}

// Storage key
const STORAGE_KEY = 'wordBookmarks';

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: true, // Start with loading to fetch data on init
  loadingError: null,

  addBookmark: (word) => {
    try {
      const currentBookmarks = get().bookmarks;
      const wordId = String(word.id);

      // Check if it's already bookmarked
      if (!currentBookmarks.some((b) => String(b.id) === wordId)) {
        const newBookmarks = [...currentBookmarks, word];

        // Save to AsyncStorage
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks)).catch((error) =>
          console.error('Error saving bookmark:', error),
        );

        // Update state
        set({ bookmarks: newBookmarks, loadingError: null });
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  },

  removeBookmark: (wordId) => {
    try {
      const wordIdStr = String(wordId);
      const newBookmarks = get().bookmarks.filter((b) => String(b.id) !== wordIdStr);

      // Save to AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks)).catch((error) =>
        console.error('Error removing bookmark:', error),
      );

      // Update state
      set({ bookmarks: newBookmarks, loadingError: null });
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  },

  isBookmarked: (wordId) => {
    const wordIdStr = String(wordId);
    return get().bookmarks.some((b) => String(b.id) === wordIdStr);
  },

  loadBookmarks: async () => {
    // Set loading state
    set({ isLoading: true, loadingError: null });

    try {
      // Try to repair corrupted storage first
      try {
        const rawData = await AsyncStorage.getItem(STORAGE_KEY);

        // Check for clearly corrupted data
        if (
          rawData &&
          typeof rawData === 'string' &&
          !rawData.startsWith('[') &&
          !rawData.startsWith('{')
        ) {
          console.log('Corrupted bookmark data detected, resetting storage');
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } catch (checkError) {
        console.warn('Error checking bookmark storage integrity:', checkError);
        // Continue anyway as we'll handle errors below
      }

      const storedData = await AsyncStorage.getItem(STORAGE_KEY);

      if (!storedData) {
        // No bookmarks stored yet
        set({ bookmarks: [], isLoading: false });
        return;
      }

      try {
        // Parse stored bookmarks
        const bookmarks = JSON.parse(storedData);

        // Handle different potential data formats with better validation
        let parsedBookmarks: Word[] = [];

        if (Array.isArray(bookmarks)) {
          // Direct array format
          parsedBookmarks = bookmarks;
        } else if (bookmarks?.bookmarks && Array.isArray(bookmarks.bookmarks)) {
          // Object with bookmarks array
          parsedBookmarks = bookmarks.bookmarks;
        } else if (bookmarks?.state?.bookmarks && Array.isArray(bookmarks.state.bookmarks)) {
          // Nested state object (zustand persist format)
          parsedBookmarks = bookmarks.state.bookmarks;
        } else {
          // Unknown format - reset storage
          console.error(
            'Unknown bookmark data format:',
            JSON.stringify(bookmarks).substring(0, 100),
          );
          await AsyncStorage.removeItem(STORAGE_KEY);
          throw new Error('Bookmarks data is not in the expected format');
        }

        // Validate bookmark entries
        const validBookmarks = parsedBookmarks.filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            item.id !== undefined &&
            typeof item.word === 'string' &&
            typeof item.meaning === 'string',
        );

        // Update state with loaded bookmarks
        set({ bookmarks: validBookmarks, isLoading: false });
      } catch (parseError) {
        console.error('Parse error with data:', storedData.substring(0, 100) + '...');
        // Reset storage since it's corrupted
        await AsyncStorage.removeItem(STORAGE_KEY);
        throw parseError;
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      set({
        isLoading: false,
        loadingError: error instanceof Error ? error.message : 'Failed to load bookmarks',
        bookmarks: [], // Reset to empty array on error
      });
    }
  },

  retryLoading: async () => {
    await get().loadBookmarks();
  },

  clearAllBookmarks: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ bookmarks: [], loadingError: null });
    } catch (error) {
      console.error('Failed to clear bookmarks:', error);
    }
  },
}));

// Initialize bookmarks when the module is loaded
useBookmarkStore.getState().loadBookmarks();
