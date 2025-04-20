import React, { useState, useCallback, useEffect, useMemo, memo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  ActivityIndicator,
  ScrollView,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { wordService, Word } from '@/services/wordService';
import WordList from '@/components/WordList';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

const WordDetailsModal = memo(({ word, onClose }: { word: Word | null; onClose: () => void }) => {
  if (!word) return null;

  return (
    <Pressable style={modalStyles.overlay} onPress={onClose}>
      <Pressable style={modalStyles.content} onPress={(e) => e.stopPropagation()}>
        <View style={modalStyles.header}>
          <ThemedText style={modalStyles.word}>{word.word}</ThemedText>
          <View style={modalStyles.statusContainer}>
            {word.important && (
              <View style={modalStyles.statusBadge}>
                <Ionicons name="star" size={16} color={Colors.dark.systemYellow} />
                <ThemedText style={modalStyles.statusText}>Important</ThemedText>
              </View>
            )}
            {word.mastered && (
              <View style={modalStyles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.dark.systemGreen} />
                <ThemedText style={modalStyles.statusText}>Mastered</ThemedText>
              </View>
            )}
          </View>
        </View>
        <View style={modalStyles.divider} />
        <ThemedText style={modalStyles.meaning}>{word.meaning}</ThemedText>
        <Pressable style={modalStyles.closeButton} onPress={onClose}>
          <ThemedText style={modalStyles.closeButtonText}>Close</ThemedText>
        </Pressable>
      </Pressable>
    </Pressable>
  );
});

// Separate modal styles to avoid naming conflicts
const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: Colors.dark.secondaryBackground,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  word: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginVertical: 16,
  },
  meaning: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.dark.secondaryText,
  },
  closeButton: {
    backgroundColor: Colors.dark.systemBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Custom tab button component
const TabButton = memo(
  ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => {
    return (
      <Pressable
        style={[styles.tabButton, isActive ? styles.activeTabButton : null]}
        onPress={onPress}>
        <ThemedText
          style={[
            styles.tabButtonText,
            isActive ? styles.activeTabButtonText : styles.inactiveTabButtonText,
          ]}>
          {title}
        </ThemedText>
        {isActive && <View style={styles.activeTabIndicator} />}
      </Pressable>
    );
  },
);

const WordListScreen = memo(
  ({ title, getWords, loading }: { title: string; getWords: () => Word[]; loading: boolean }) => {
    const [words, setWords] = useState<Word[]>([]);
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [showSearchBar, setShowSearchBar] = useState(true);
    const lastScrollY = useRef(0);
    const searchBarHeight = useRef(new Animated.Value(50)).current;
    const searchBarOpacity = useRef(new Animated.Value(1)).current;
    const { impact } = useHaptics();

    useEffect(() => {
      if (!loading) {
        setWords(getWords());
      }
    }, [getWords, loading]);

    // Animation for showing/hiding search bar
    useEffect(() => {
      // Animate height and opacity
      Animated.parallel([
        Animated.timing(searchBarHeight, {
          toValue: showSearchBar ? 66 : 0, // Account for container margins
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(searchBarOpacity, {
          toValue: showSearchBar ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }, [showSearchBar, searchBarHeight, searchBarOpacity]);

    const filteredWords = useMemo(() => {
      if (!searchQuery && Object.keys(searchFilters).length === 0) {
        return words;
      }

      let result = words;

      // Apply text search filtering
      if (searchQuery) {
        result = result.filter(
          (word) =>
            word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Apply additional filters
      if (searchFilters.onlyMastered) {
        result = result.filter((word) => word.mastered);
      } else if (searchFilters.onlyNotMastered) {
        result = result.filter((word) => !word.mastered);
      }

      if (searchFilters.onlyImportant) {
        result = result.filter((word) => word.important);
      }

      return result;
    }, [words, searchQuery, searchFilters]);

    const handleWordPress = useCallback(
      (word: Word) => {
        impact();
        setSelectedWord(word);
      },
      [impact],
    );

    const closeWordDetails = useCallback(() => {
      setSelectedWord(null);
    }, []);

    const handleSearch = useCallback((query: string, filters?: SearchFilters) => {
      setSearchQuery(query);
      if (filters) setSearchFilters(filters);
    }, []);

    const handleMasteredToggle = useCallback(
      (word: Word, mastered: boolean) => {
        impact();
        wordService.toggleWordMastered(word.id);
        // Refresh the list of words
        setWords(getWords());
      },
      [getWords, impact],
    );

    const handleImportantToggle = useCallback(
      (word: Word, important: boolean) => {
        impact();
        wordService.toggleWordImportant(word.id);
        // Refresh the list of words
        setWords(getWords());
      },
      [getWords, impact],
    );

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;

      // Only change visibility if scrolled more than 5 units to avoid flickering
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
      if (scrollDelta < 5) return;

      // Determine scroll direction
      if (currentScrollY <= 0) {
        // At the top, always show search bar
        setShowSearchBar(true);
      } else if (currentScrollY > lastScrollY.current + 3) {
        // Add a small threshold
        // Scrolling down, hide search bar
        setShowSearchBar(false);
      } else if (currentScrollY < lastScrollY.current - 3) {
        // Add a small threshold
        // Scrolling up, show search bar
        setShowSearchBar(true);
      }

      // Save last scroll position
      lastScrollY.current = currentScrollY;
    }, []);

    return (
      <ThemedView style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.searchBarContainer,
            {
              height: searchBarHeight,
              opacity: searchBarOpacity,
              overflow: 'hidden',
              zIndex: 10,
            },
          ]}>
          <SearchBar onSearch={handleSearch} />
        </Animated.View>
        <View style={styles.wordListContainer}>
          <WordList
            words={filteredWords}
            onItemPress={handleWordPress}
            onMasteredToggle={handleMasteredToggle}
            onImportantToggle={handleImportantToggle}
            searchQuery={searchQuery}
            onScroll={handleScroll}
          />
        </View>
        <WordDetailsModal word={selectedWord} onClose={closeWordDetails} />
      </ThemedView>
    );
  },
);

function Index() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Initialize words on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeWords = async () => {
      try {
        setLoading(true);
        await wordService.init();
        // Only update state if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing words:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeWords();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Word getter functions for each tab
  const getAllWords = useCallback(() => wordService.getAllWords(), []);
  const getImportantWords = useCallback(() => wordService.getImportantWords(), []);
  const getMasteredWords = useCallback(() => wordService.getMasteredWords(), []);
  const getImportantNotMasteredWords = useCallback(
    () => wordService.getImportantButNotMasteredWords(),
    [],
  );

  // Tab config
  const tabs = useMemo(
    () => [
      { title: 'All Words', getWords: getAllWords },
      { title: 'Important', getWords: getImportantWords },
      { title: 'Mastered', getWords: getMasteredWords },
      { title: 'Important Not Mastered', getWords: getImportantNotMasteredWords },
    ],
    [getAllWords, getImportantWords, getMasteredWords, getImportantNotMasteredWords],
  );

  // Loading indicator
  const loadingComponent = useMemo(
    () =>
      loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.dark.systemBlue} />
          <ThemedText>Loading words...</ThemedText>
        </View>
      ) : null,
    [loading],
  );

  if (loading) {
    return <ThemedView style={styles.container}>{loadingComponent}</ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}>
          {tabs.map((tab, index) => (
            <TabButton
              key={index}
              title={tab.title}
              isActive={activeTab === index}
              onPress={() => setActiveTab(index)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Display the active tab content */}
      <WordListScreen
        title={tabs[activeTab].title}
        getWords={tabs[activeTab].getWords}
        loading={loading}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  wordListContainer: {
    flex: 1,
    marginTop: 8,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    position: 'relative',
  },
  activeTabButton: {
    borderBottomColor: Colors.dark.systemBlue,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: Colors.dark.systemBlue,
    fontWeight: '600',
  },
  inactiveTabButtonText: {
    color: Colors.dark.secondaryText,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '80%',
    backgroundColor: Colors.dark.systemBlue,
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  searchBarContainer: {
    width: '100%',
  },
});

export default memo(Index);
