import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import WordCard from '@/components/WordCard';
import wordList from '@/assets/data/words.json';

const MAX_VISIBLE_CARDS = 3;

export default function Index() {
  const [words, setWords] = useState(wordList);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    console.log(`Swiped ${direction}: ${words[currentIndex]?.word}`);
    
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [currentIndex, words]);

  const handleReset = () => {
    console.log('Resetting words...');
    setWords(wordList); 
    setCurrentIndex(0); 
  };

  
  const renderCards = () => {
    if (currentIndex >= words.length) {
      return (
        <View style={styles.endContainer}>
          <Text style={styles.endText}>No more words!</Text>
          <Button title="Start Over" onPress={handleReset} color="#ffd33d" />
        </View>
      );
    }

    return words
      .map((word, index) => {
        if (index < currentIndex || index >= currentIndex + MAX_VISIBLE_CARDS) {
          return null; 
        }

        const isTopCard = index === currentIndex;

        return (
          <WordCard
            key={word.id}
            word={word}
            onSwipe={handleSwipe}
            isActive={isTopCard}
          />
        );
      })
      .reverse(); 
  };

  return (
    <View style={styles.container}>
      {renderCards()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
});
