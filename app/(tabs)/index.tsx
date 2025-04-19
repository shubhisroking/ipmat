import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import WordCard from '@/components/WordCard';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { wordService, Word } from '@/services/wordService';

const MAX_VISIBLE_CARDS = 3;

export default function Index() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Initialize words on component mount
  useEffect(() => {
    const initializeWords = async () => {
      setLoading(true);
      await wordService.init();
      const initialWords = wordService.getWords();
      setWords(initialWords);
      setLoading(false);
    };
    
    initializeWords();
  }, []);
  
  // Load more words when approaching the end
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      // Load more when user is halfway through the current batch
      const loadThreshold = Math.floor(words.length * 0.7);
      
      if (currentIndex >= loadThreshold && !loadingMore && words.length < wordService.getTotalWordCount()) {
        setLoadingMore(true);
        const newWords = wordService.loadMoreWords(words.length);
        setWords(prevWords => [...prevWords, ...newWords]);
        setLoadingMore(false);
      }
    };
    
    loadMoreIfNeeded();
  }, [currentIndex, words, loadingMore]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    console.log(`Swiped ${direction}: ${words[currentIndex]?.word}`);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [currentIndex, words]);

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Resetting words...');
    const shuffledWords = wordService.shuffleWords();
    setWords(shuffledWords.slice(0, 50)); // Load first 50 shuffled words
    setCurrentIndex(0); 
  };

  const intensity = 40; 
    const renderCards = () => {
    if (currentIndex >= words.length) {
      return (
        <BlurView intensity={intensity} tint="dark" style={styles.endBlurContainer}>
          <View style={styles.endContainer}>
            <ThemedText style={styles.endText}>No more words!</ThemedText>
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.8 : 1, backgroundColor: Colors.dark.systemBlue }
              ]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Start Over</Text>
            </Pressable>
          </View>
        </BlurView>
      );
    }

    // Only process the visible cards (much more efficient)
    const visibleCards = [];
    const endIndex = Math.min(currentIndex + MAX_VISIBLE_CARDS, words.length);
    
    for (let i = currentIndex; i < endIndex; i++) {
      const word = words[i];
      const isTopCard = i === currentIndex;
      
      visibleCards.push(
        <WordCard
          key={word.id}
          word={word}
          onSwipe={handleSwipe}
          isActive={isTopCard}
        />
      );
    }
    
    return visibleCards.reverse();
  };
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: Colors.dark.background }
    ]}>
      {renderCards()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBlurContainer: {
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  endContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});
