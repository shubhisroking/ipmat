import React, { useState, useCallback } from 'react';
import { StyleSheet, Button, useColorScheme, View, Text } from 'react-native';
import WordCard from '@/components/WordCard';
import wordList from '@/assets/data/words.json';
import { Colors } from '@/constants/Colors';

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

    const colorScheme = useColorScheme() ?? 'light';
  
  const renderCards = () => {
    if (currentIndex >= words.length) {
      return (
        <View style={styles.endContainer}>
          <Text style={[styles.endText, { color: Colors[colorScheme].text }]}>No more words!</Text>
          <Button title="Start Over" onPress={handleReset} color={Colors[colorScheme].systemBlue} />
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
    <View style={[
      styles.container, 
      { backgroundColor: Colors[colorScheme].background }
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
  endContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 24,
  },
});
