import AsyncStorage from '@react-native-async-storage/async-storage';
import allWords from '@/assets/data/words.json';

// The batch size to load words in chunks
const BATCH_SIZE = 50;
const WORD_CACHE_KEY = 'word_cache';
const MASTERED_WORDS_KEY = 'mastered_words';
const SAVE_DEBOUNCE_TIME = 2000; // 2 seconds debounce time

export type Word = {
  id: number | string;
  word: string;
  meaning: string;
  mastered?: boolean;
  important?: boolean;
};

class WordService {
  private cachedWords: Word[] = [];
  private wordMap: Map<string | number, Word> = new Map();
  private masteredWordsIds: Set<string | number> = new Set();
  private importantWordsIds: Set<string | number> = new Set();
  private isLoaded: boolean = false;
  private isDirty: boolean = false;
  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private static readonly IMPORTANT_WORDS_KEY = 'important_words';

  // Initialize the service by loading saved words from AsyncStorage cache
  async init(): Promise<void> {
    if (this.isLoaded) return; // Prevent multiple initializations

    try {
      const cachedWordsJson = await AsyncStorage.getItem(WORD_CACHE_KEY);
      const masteredWordsJson = await AsyncStorage.getItem(MASTERED_WORDS_KEY);
      const importantWordsJson = await AsyncStorage.getItem(WordService.IMPORTANT_WORDS_KEY);

      if (masteredWordsJson) {
        const masteredIds = JSON.parse(masteredWordsJson);
        this.masteredWordsIds = new Set(masteredIds);
      }

      if (importantWordsJson) {
        const importantIds = JSON.parse(importantWordsJson);
        this.importantWordsIds = new Set(importantIds);
      }

      if (cachedWordsJson) {
        this.cachedWords = JSON.parse(cachedWordsJson);
        this.initializeWordMap();
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

  // Create and populate a map of words for faster lookups
  private initializeWordMap(): void {
    this.wordMap.clear();
    for (const word of this.cachedWords) {
      this.wordMap.set(word.id, word);
    }

    // Pre-fill with all words for better performance
    for (const word of allWords) {
      if (!this.wordMap.has(word.id)) {
        // Clone the word to avoid modifying the original data
        const wordWithFlags = {
          ...word,
          mastered: this.masteredWordsIds.has(word.id),
          important: this.importantWordsIds.has(word.id),
        };
        this.wordMap.set(word.id, wordWithFlags);
      }
    }
  }

  // Load the initial batch of words
  async loadInitialBatch(): Promise<Word[]> {
    this.cachedWords = allWords.slice(0, BATCH_SIZE).map((word) => ({
      ...word,
      mastered: this.masteredWordsIds.has(word.id),
      important: this.importantWordsIds.has(word.id),
    }));
    this.initializeWordMap();
    this.isLoaded = true;
    this.saveCache();
    return this.cachedWords;
  }

  // Get words with optional index range limits
  getWords(startIndex = 0, limit = BATCH_SIZE): Word[] {
    if (!this.isLoaded) {
      // Return from the original dataset if not loaded yet
      return allWords
        .slice(startIndex, Math.min(startIndex + limit, allWords.length))
        .map((word) => ({
          ...word,
          mastered: this.masteredWordsIds.has(word.id),
          important: this.importantWordsIds.has(word.id),
        }));
    }

    // Return from the cached dataset for better performance
    const endIndex = Math.min(startIndex + limit, allWords.length);
    return allWords.slice(startIndex, endIndex).map((word) => ({
      ...word,
      mastered: this.masteredWordsIds.has(word.id),
      important: this.importantWordsIds.has(word.id),
    }));
  }

  // Get all words
  getAllWords(): Word[] {
    return allWords.map((word) => ({
      ...word,
      mastered: this.masteredWordsIds.has(word.id),
      important: this.importantWordsIds.has(word.id),
    }));
  }

  // Get only mastered words
  getMasteredWords(): Word[] {
    return allWords
      .filter((word) => this.masteredWordsIds.has(word.id))
      .map((word) => ({
        ...word,
        mastered: true,
      }));
  }

  // Get important words
  getImportantWords(): Word[] {
    return allWords
      .filter((word) => this.importantWordsIds.has(word.id))
      .map((word) => ({
        ...word,
        mastered: this.masteredWordsIds.has(word.id),
        important: true,
      }));
  }

  // Get important but not mastered words
  getImportantButNotMasteredWords(): Word[] {
    return this.getImportantWords().filter((word) => !this.masteredWordsIds.has(word.id));
  }

  // Toggle mastered status for a word
  toggleWordMastered(wordId: string | number): boolean {
    const mastered = !this.masteredWordsIds.has(wordId);

    if (mastered) {
      this.masteredWordsIds.add(wordId);
    } else {
      this.masteredWordsIds.delete(wordId);
    }

    // Update the word in the map if it exists
    const word = this.wordMap.get(wordId);
    if (word) {
      word.mastered = mastered;
    }

    // Save the mastered words
    this.saveMasteredWords();

    return mastered;
  }

  // Toggle important status for a word
  toggleWordImportant(wordId: string | number): boolean {
    const important = !this.importantWordsIds.has(wordId);

    if (important) {
      this.importantWordsIds.add(wordId);
    } else {
      this.importantWordsIds.delete(wordId);
    }

    // Update the word in the map if it exists
    const word = this.wordMap.get(wordId);
    if (word) {
      word.important = important;
    }

    // Save the important words
    this.saveImportantWords();

    return important;
  }

  // Load more words - returns a batch starting from the given index
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
    return allWords.slice(startIndex, endIndex).map((word) => ({
      ...word,
      mastered: this.masteredWordsIds.has(word.id),
    }));
  }

  // Get a word by ID - uses the map for faster lookups
  getWordById(id: string | number): Word | undefined {
    return this.wordMap.get(id);
  }

  // Get the total count of available words
  getTotalWordCount(): number {
    return allWords.length;
  }

  // Get the count of mastered words
  getMasteredWordCount(): number {
    return this.masteredWordsIds.size;
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

  // Save the mastered words to AsyncStorage
  private saveMasteredWords(): void {
    try {
      AsyncStorage.setItem(MASTERED_WORDS_KEY, JSON.stringify(Array.from(this.masteredWordsIds)));
    } catch (error) {
      console.error('Error saving mastered words:', error);
    }
  }

  // Save the important words to AsyncStorage
  private saveImportantWords(): void {
    try {
      AsyncStorage.setItem(
        WordService.IMPORTANT_WORDS_KEY,
        JSON.stringify(Array.from(this.importantWordsIds)),
      );
    } catch (error) {
      console.error('Error saving important words:', error);
    }
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

    // Fisher-Yates shuffle algorithm - optimized version
    let currentIndex = shuffled.length;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Swap elements
      [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[currentIndex],
      ];
    }

    return shuffled.map((word) => ({
      ...word,
      mastered: this.masteredWordsIds.has(word.id),
    }));
  }
}

// Export a singleton instance
export const wordService = new WordService();
