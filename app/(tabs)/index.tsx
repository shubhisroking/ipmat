import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import WordCard from '@/components/WordCard';
import wordList from '@/assets/data/words.json';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

const MAX_VISIBLE_CARDS = 3;

export default function Index() {
  const [words, setWords] = useState(wordList);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    console.log(`Swiped ${direction}: ${words[currentIndex]?.word}`);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [currentIndex, words]);

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Resetting words...');
    setWords(wordList); 
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
