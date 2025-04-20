import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import { StyleSheet, View, Pressable, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { wordService, Word } from '@/services/wordService';
import WordList from '@/components/WordList';
import SearchBar from '@/components/SearchBar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const WordDetailsModal = memo(({ word, onClose }: { word: Word | null, onClose: () => void }) => {
  if (!word) return null;
  
  return (
    <Pressable style={styles.modal} onPress={onClose}>
      <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
        <ThemedText style={styles.modalWord}>{word.word}</ThemedText>
        <ThemedText style={styles.modalMeaning}>{word.meaning}</ThemedText>
        <Text style={styles.modalCloseText}>Tap outside to close</Text>
      </Pressable>
    </Pressable>
  );
});

// Custom tab button component
const TabButton = memo(({ 
  title, 
  isActive, 
  onPress 
}: { 
  title: string, 
  isActive: boolean, 
  onPress: () => void 
}) => {
  return (
    <Pressable
      style={[
        styles.tabButton,
        isActive ? styles.activeTabButton : null
      ]}
      onPress={onPress}
    >
      <ThemedText 
        style={[
          styles.tabButtonText,
          isActive ? styles.activeTabButtonText : styles.inactiveTabButtonText
        ]}
      >
        {title}
      </ThemedText>
      {isActive && <View style={styles.activeTabIndicator} />}
    </Pressable>
  );
});

const WordListScreen = memo(({ 
  title, 
  getWords, 
  loading 
}: { 
  title: string, 
  getWords: () => Word[], 
  loading: boolean 
}) => {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading) {
      setWords(getWords());
    }
  }, [getWords, loading]);

  const filteredWords = useMemo(() => {
    if (!searchQuery) return words;
    return words.filter(word => 
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [words, searchQuery]);

  const handleWordPress = useCallback((word: Word) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWord(word);
  }, []);

  const closeWordDetails = useCallback(() => {
    setSelectedWord(null);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleMasteredToggle = useCallback((word: Word, mastered: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    wordService.toggleWordMastered(word.id);
    // Refresh the list of words
    setWords(getWords());
  }, [getWords]);

  return (
    <ThemedView style={styles.contentContainer}>
      <SearchBar onSearch={handleSearch} />
      <WordList 
        words={filteredWords}
        onItemPress={handleWordPress}
        onMasteredToggle={handleMasteredToggle}
      />
      <WordDetailsModal word={selectedWord} onClose={closeWordDetails} />
    </ThemedView>
  );
});

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
  const getImportantNotMasteredWords = useCallback(() => wordService.getImportantButNotMasteredWords(), []);

  // Tab config
  const tabs = useMemo(() => [
    { title: 'All Words', getWords: getAllWords },
    { title: 'Important', getWords: getImportantWords },
    { title: 'Mastered', getWords: getMasteredWords },
    { title: 'Important Not Mastered', getWords: getImportantNotMasteredWords }
  ], [getAllWords, getImportantWords, getMasteredWords, getImportantNotMasteredWords]);

  // Loading indicator
  const loadingComponent = useMemo(() => (
    loading ? (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={Colors.dark.systemBlue} />
        <ThemedText>Loading words...</ThemedText>
      </View>
    ) : null
  ), [loading]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        {loadingComponent}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
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
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.dark.secondaryBackground,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalWord: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMeaning: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCloseText: {
    fontSize: 14,
    color: Colors.dark.systemGray,
    marginTop: 8,
  },
});

export default memo(Index);
