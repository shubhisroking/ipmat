import AsyncStorage from '@react-native-async-storage/async-storage';
import allWords from '@/assets/data/words.json';

// The batch size to load words in chunks
const BATCH_SIZE = 50;
const WORD_CACHE_KEY = 'word_cache';
const SAVE_DEBOUNCE_TIME = 2000; // 2 seconds debounce time

export type Word = {
  id: number | string;
  word: string;
  meaning: string;
};

class WordService {
  private cachedWords: Word[] = [];
  private isLoaded: boolean = false;
  private isDirty: boolean = false;
  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Initialize the service by loading saved words from AsyncStorage cache
  async init(): Promise<void> {
    try {
      const cachedWordsJson = await AsyncStorage.getItem(WORD_CACHE_KEY);
      if (cachedWordsJson) {
        this.cachedWords = JSON.parse(cachedWordsJson);
        this.isLoaded = true;
      } else {
        // If no cache exists, load the initial batch
        await this.loadInitialBatch();
      }
    } catch (error) {
      console.error('Error initializing word service:', error);
      // Fallback to load initial batch if cache fails
      await this.loadInitialBatch();
    }
  }

  // Load the initial batch of words
  async loadInitialBatch(): Promise<Word[]> {
    this.cachedWords = allWords.slice(0, BATCH_SIZE);
    this.isLoaded = true;
    this.saveCache();
    return this.cachedWords;
  }

  // Get words with optional index range limits
  getWords(startIndex = 0, limit = BATCH_SIZE): Word[] {
    const endIndex = Math.min(startIndex + limit, allWords.length);
    return allWords.slice(startIndex, endIndex);
  }  // Load more words - returns a batch starting from the given index
  loadMoreWords(startIndex: number): Word[] {
    const newBatch = this.getWords(startIndex, BATCH_SIZE);
    
    // Update the cached words array with new batch
    this.cachedWords = [...this.cachedWords, ...newBatch];
    
    // Mark as dirty and queue a save operation
    this.queueSave();
    
    return newBatch;
  }

  // Retrieve a subset of words from start to end index
  getWordSubset(startIndex: number, endIndex: number): Word[] {
    return allWords.slice(startIndex, endIndex);
  }

  // Get the total count of available words
  getTotalWordCount(): number {
    return allWords.length;
  }

  // Queue a debounced save operation
  private queueSave(): void {
    // Mark the cache as dirty
    this.isDirty = true;
    
    // Clear any existing timeout to avoid multiple saves
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }
    
    // Set a new timeout to save after the debounce period
    this.saveTimeoutId = setTimeout(() => {
      if (this.isDirty) {
        this.saveCacheImmediately();
      }
    }, SAVE_DEBOUNCE_TIME);
  }
  
  // Save the current word cache to AsyncStorage immediately
  private async saveCacheImmediately(): Promise<void> {
    try {
      await AsyncStorage.setItem(WORD_CACHE_KEY, JSON.stringify(this.cachedWords));
      this.isDirty = false;
    } catch (error) {
      console.error('Error saving word cache:', error);
    }
  }
  
  // Save the current word cache to AsyncStorage with debouncing
  private saveCache(): void {
    this.queueSave();
  }

  // Shuffle words for a randomized learning experience
  shuffleWords(): Word[] {
    const shuffled = [...allWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export a singleton instance
export const wordService = new WordService();
