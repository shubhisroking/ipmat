import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

type Word = {
  id: number | string; 
  word: string;
  meaning: string;
};

// Custom error types for better error handling
enum BookmarkErrorType {
  LOAD_ERROR = 'LOAD_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
}

interface BookmarkError {
  type: BookmarkErrorType;
  message: string;
  originalError?: Error;
}

interface BookmarkState {
  bookmarks: Word[];
  bookmarkMap: Record<string, boolean>; // Fast lookup map for bookmarked items
  isLoading: boolean; // Loading state for UI feedback
  isLoadingMore: boolean; // For progressive loading
  loadingError: BookmarkError | null; // Enhanced error handling
  batch: number; // Current batch number for progressive loading
  batchSize: number; // Number of bookmarks to load per batch
  hasMoreToLoad: boolean; // Whether there are more bookmarks to load
  
  // Methods
  addBookmark: (word: Word) => void;
  removeBookmark: (wordId: number | string) => void;
  isBookmarked: (wordId: number | string) => boolean;
  loadBookmarks: () => Promise<void>;
  loadMoreBookmarks: () => Promise<void>; // Progressive loading
  retryLoading: () => Promise<void>; // For retrying after errors
}

const STORAGE_KEY = 'wordBookmarks';
const DEFAULT_BATCH_SIZE = 20; // Load 20 bookmarks at a time

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      bookmarkMap: {},
      isLoading: false,
      isLoadingMore: false,
      loadingError: null,
      batch: 0,
      batchSize: DEFAULT_BATCH_SIZE,
      hasMoreToLoad: false,

      addBookmark: (word) => {
        try {
          const wordId = String(word.id); // Convert to string for consistent key type
          if (!get().bookmarkMap[wordId]) {
            set((state) => ({ 
              bookmarks: [...state.bookmarks, word],
              bookmarkMap: { ...state.bookmarkMap, [wordId]: true },
              // Clear any previous error when successfully adding a bookmark
              loadingError: null
            }));
          }
        } catch (error) {
          console.error('Failed to add bookmark:', error);
          set({ 
            loadingError: { 
              type: BookmarkErrorType.SAVE_ERROR, 
              message: 'Failed to add bookmark', 
              originalError: error instanceof Error ? error : new Error(String(error))
            } 
          });
        }
      },

      removeBookmark: (wordId) => {
        try {
          const wordIdStr = String(wordId); // Convert to string for consistent key type
          set((state) => ({
            bookmarks: state.bookmarks.filter((b) => String(b.id) !== wordIdStr),
            bookmarkMap: { ...state.bookmarkMap, [wordIdStr]: false },
            // Clear any previous error when successfully removing a bookmark
            loadingError: null
          }));
        } catch (error) {
          console.error('Failed to remove bookmark:', error);
          set({ 
            loadingError: { 
              type: BookmarkErrorType.SAVE_ERROR, 
              message: 'Failed to remove bookmark', 
              originalError: error instanceof Error ? error : new Error(String(error))
            } 
          });
        }
      },

      isBookmarked: (wordId) => {
        return !!get().bookmarkMap[String(wordId)];
      },
      
      loadBookmarks: async () => {
        // Set loading state to true
        set({ isLoading: true, loadingError: null });
        
        try {
          const storedBookmarks = await AsyncStorage.getItem(STORAGE_KEY);
          
          if (!storedBookmarks) {
            // No bookmarks stored yet, set initial state
            set({ 
              bookmarks: [], 
              bookmarkMap: {}, 
              isLoading: false,
              batch: 0,
              hasMoreToLoad: false
            });
            return;
          }
          
          // Try to parse the stored bookmarks
          let parsedBookmarks;
          try {
            parsedBookmarks = JSON.parse(storedBookmarks);
          } catch (parseError) {
            throw {
              type: BookmarkErrorType.PARSE_ERROR,
              message: 'Could not parse saved bookmarks',
              originalError: parseError
            };
          }
          
          // Validate the parsed data
          if (!parsedBookmarks?.bookmarks || !Array.isArray(parsedBookmarks.bookmarks)) {
            throw {
              type: BookmarkErrorType.PARSE_ERROR,
              message: 'Bookmarks data is not in the expected format'
            };
          }
          
          const allBookmarks = parsedBookmarks.bookmarks;
          const totalCount = allBookmarks.length;
          const firstBatch = allBookmarks.slice(0, DEFAULT_BATCH_SIZE);
          
          // Build the lookup map from all bookmarks (not just the first batch)
          // This ensures isBookmarked works correctly even for items not yet loaded
          const lookupMap: Record<string, boolean> = {};
          allBookmarks.forEach((bookmark: Word) => {
            lookupMap[String(bookmark.id)] = true;
          });
          
          set({ 
            // Only load the first batch initially
            bookmarks: firstBatch,
            // But keep the full map for fast lookups
            bookmarkMap: lookupMap,
            isLoading: false,
            batch: 1,
            hasMoreToLoad: totalCount > DEFAULT_BATCH_SIZE
          });
          
        } catch (error) {
          console.error('Failed to load bookmarks from storage:', error);
          
          // Set error state with detailed information
          set({ 
            isLoading: false, 
            loadingError: {
              type: error.type || BookmarkErrorType.LOAD_ERROR,
              message: error.message || 'Failed to load bookmarks',
              originalError: error.originalError || error
            },
            // Reset to empty state on error
            bookmarks: [],
            bookmarkMap: {}
          });
        }
      },
      
      loadMoreBookmarks: async () => {
        const { batch, batchSize, isLoadingMore, hasMoreToLoad } = get();
        
        // Don't do anything if already loading or no more bookmarks to load
        if (isLoadingMore || !hasMoreToLoad) {
          return;
        }
        
        set({ isLoadingMore: true, loadingError: null });
        
        try {
          const storedBookmarks = await AsyncStorage.getItem(STORAGE_KEY);
          
          if (!storedBookmarks) {
            set({ isLoadingMore: false, hasMoreToLoad: false });
            return;
          }
          
          const parsedBookmarks = JSON.parse(storedBookmarks);
          
          if (!parsedBookmarks?.bookmarks || !Array.isArray(parsedBookmarks.bookmarks)) {
            throw {
              type: BookmarkErrorType.PARSE_ERROR,
              message: 'Bookmarks data is not in the expected format'
            };
          }
          
          const allBookmarks = parsedBookmarks.bookmarks;
          const startIndex = batch * batchSize;
          const endIndex = startIndex + batchSize;
          const newBatch = allBookmarks.slice(startIndex, endIndex);
          
          set((state) => ({
            // Append new batch to existing bookmarks
            bookmarks: [...state.bookmarks, ...newBatch],
            isLoadingMore: false,
            batch: batch + 1,
            // Check if there are more bookmarks to load
            hasMoreToLoad: endIndex < allBookmarks.length
          }));
          
        } catch (error) {
          console.error('Failed to load more bookmarks:', error);
          
          set({ 
            isLoadingMore: false, 
            loadingError: {
              type: error.type || BookmarkErrorType.LOAD_ERROR,
              message: error.message || 'Failed to load more bookmarks',
              originalError: error.originalError || error
            }
          });
        }
      },
      
      retryLoading: async () => {
        // Clear previous error and retry loading
        await get().loadBookmarks();
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Initialize the bookmarks when the module is loaded
console.log('Starting rehydration for bookmarks');





