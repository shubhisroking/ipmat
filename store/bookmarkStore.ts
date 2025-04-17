import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

type Word = {
  id: number | string; 
  word: string;
  meaning: string;
};

interface BookmarkState {
  bookmarks: Word[];
  addBookmark: (word: Word) => void;
  removeBookmark: (wordId: number | string) => void;
  isBookmarked: (wordId: number | string) => boolean;
  loadBookmarks: () => Promise<void>; 
}

const STORAGE_KEY = 'wordBookmarks';

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (word) => {
        if (!get().isBookmarked(word.id)) {
          set((state) => ({ bookmarks: [...state.bookmarks, word] }));
        }
      },

      removeBookmark: (wordId) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== wordId),
        }));
      },

      isBookmarked: (wordId) => {
        return get().bookmarks.some((b) => b.id === wordId);
      },

      
      loadBookmarks: async () => {
        try {
          const storedBookmarks = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedBookmarks) {
            
            const parsedBookmarks = JSON.parse(storedBookmarks);
            if (Array.isArray(parsedBookmarks.state?.bookmarks)) {
               set({ bookmarks: parsedBookmarks.state.bookmarks });
            } else {
               console.warn("Loaded bookmarks data is not in the expected format:", parsedBookmarks);
               set({ bookmarks: []}); 
            }
          }
        } catch (error) {
          console.error('Failed to load bookmarks from storage:', error);
          
           set({ bookmarks: []});
        }
      },
    }),
    {
      name: STORAGE_KEY, 
      storage: createJSONStorage(() => AsyncStorage), 
      
      
       
      onRehydrateStorage: (state) => {
        console.log("Hydration finished for bookmarks");
        
        return (state, error) => {
          if (error) {
            console.error("An error happened during bookmark storage hydration:", error);
          }
        };
      },
    }
  )
);





