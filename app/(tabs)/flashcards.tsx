import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { wordService, Word } from '@/services/wordService';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

const { width } = Dimensions.get('window');

function FlashcardsScreen() {
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'important' | 'mastered' | 'not-mastered'>('all');
  
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const { impact } = useHaptics();

  // Initialize words
  useEffect(() => {
    loadWords();
  }, [filterType]);

  const loadWords = async () => {
    try {
      setLoading(true);
      await wordService.init();
      
      let filteredWords: Word[] = [];
      switch (filterType) {
        case 'all':
          filteredWords = wordService.getAllWords();
          break;
        case 'important':
          filteredWords = wordService.getImportantWords();
          break;
        case 'mastered':
          filteredWords = wordService.getMasteredWords();
          break;
        case 'not-mastered':
          filteredWords = wordService.getAllWords().filter(word => !word.mastered);
          break;
      }
      
      setWords(filteredWords);
      setCurrentIndex(0);
      setFlipped(false);
      resetCardPosition();
      setLoading(false);
    } catch (error) {
      console.error('Error loading flashcards:', error);
      setLoading(false);
    }
  };

  const resetCardPosition = () => {
    cardAnimation.setValue(0);
  };

  // Navigation functions
  const navigateToNextCard = () => {
    if (currentIndex >= words.length - 1) return;
    
    // Animate card to exit left
    Animated.timing(cardAnimation, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
      setFlipped(false);
      cardAnimation.setValue(width); // Position next card off-screen to the right
      
      // Animate card to enter from right
      Animated.timing(cardAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    
    impact();
  };

  const navigateToPreviousCard = () => {
    if (currentIndex <= 0) return;
    
    // Animate card to exit right
    Animated.timing(cardAnimation, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(prevIndex => prevIndex - 1);
      setFlipped(false);
      cardAnimation.setValue(-width); // Position previous card off-screen to the left
      
      // Animate card to enter from left
      Animated.timing(cardAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    
    impact();
  };

  // Flip card animation
  const flipCard = () => {
    if (words.length === 0) return;
    
    Animated.timing(flipAnimation, {
      toValue: flipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
    
    impact();
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const cardAnimatedStyle = {
    transform: [{ translateX: cardAnimation }],
  };

  // Handle toggle for mastered/important
  const toggleMastered = useCallback(() => {
    if (words.length === 0) return;
    
    const word = words[currentIndex];
    wordService.toggleWordMastered(word.id);
    
    // Update the current word in the state
    const updatedWords = [...words];
    updatedWords[currentIndex] = {
      ...word,
      mastered: !word.mastered,
    };
    setWords(updatedWords);
    
    impact();
  }, [words, currentIndex, impact]);

  const toggleImportant = useCallback(() => {
    if (words.length === 0) return;
    
    const word = words[currentIndex];
    wordService.toggleWordImportant(word.id);
    
    // Update the current word in the state
    const updatedWords = [...words];
    updatedWords[currentIndex] = {
      ...word,
      important: !word.important,
    };
    setWords(updatedWords);
    
    impact();
  }, [words, currentIndex, impact]);

  // Filter option selector
  interface FilterOptionProps {
    label: string;
    value: 'all' | 'important' | 'mastered' | 'not-mastered';
    selectedValue: 'all' | 'important' | 'mastered' | 'not-mastered';
    onSelect: (value: 'all' | 'important' | 'mastered' | 'not-mastered') => void;
  }

  const FilterOption = ({ label, value, selectedValue, onSelect }: FilterOptionProps) => (
    <TouchableOpacity
      style={[styles.filterOption, value === selectedValue ? styles.filterOptionActive : null]}
      onPress={() => onSelect(value)}>
      <ThemedText
        style={[styles.filterText, value === selectedValue ? styles.filterTextActive : null]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  // Loading indicator
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="sync" size={48} color={Colors.dark.systemBlue} style={styles.spinIcon} />
          <ThemedText style={styles.loadingText}>Loading flashcards...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Empty state
  if (words.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollView}>
            <FilterOption label="All Words" value="all" selectedValue={filterType} onSelect={setFilterType} />
            <FilterOption label="Important" value="important" selectedValue={filterType} onSelect={setFilterType} />
            <FilterOption label="Mastered" value="mastered" selectedValue={filterType} onSelect={setFilterType} />
            <FilterOption label="Not Mastered" value="not-mastered" selectedValue={filterType} onSelect={setFilterType} />
          </ScrollView>
        </View>
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="albums-outline"
              size={70}
              color={Colors.dark.secondaryText}
              style={styles.emptyIcon}
            />
          </View>
          <ThemedText style={styles.emptyText}>No flashcards available</ThemedText>
          <ThemedText variant="tertiary" style={styles.emptySubText}>
            Try selecting a different category or add some words to your important or mastered lists.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Filter options */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollView}>
          <FilterOption label="All Words" value="all" selectedValue={filterType} onSelect={setFilterType} />
          <FilterOption label="Important" value="important" selectedValue={filterType} onSelect={setFilterType} />
          <FilterOption label="Mastered" value="mastered" selectedValue={filterType} onSelect={setFilterType} />
          <FilterOption label="Not Mastered" value="not-mastered" selectedValue={filterType} onSelect={setFilterType} />
        </ScrollView>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <ThemedText style={styles.progressText}>
          {currentIndex + 1} of {words.length}
        </ThemedText>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.cardAnimatedContainer, cardAnimatedStyle]}>
          <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.cardTouchable}>
            <Animated.View style={[styles.card, frontAnimatedStyle, { zIndex: flipped ? 0 : 1 }]}>
              <View style={styles.cardHeader}>
                {words[currentIndex]?.important && (
                  <Ionicons name="star" size={24} color={Colors.dark.systemYellow} style={styles.cardIcon} />
                )}
                {words[currentIndex]?.mastered && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.dark.systemGreen} style={styles.cardIcon} />
                )}
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardWord}>{words[currentIndex]?.word}</ThemedText>
                <ThemedText style={styles.cardHint}>Tap to see meaning</ThemedText>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                backAnimatedStyle,
                { zIndex: flipped ? 1 : 0 },
              ]}>
              <View style={styles.cardHeader}>
                {words[currentIndex]?.important && (
                  <Ionicons name="star" size={24} color={Colors.dark.systemYellow} style={styles.cardIcon} />
                )}
                {words[currentIndex]?.mastered && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.dark.systemGreen} style={styles.cardIcon} />
                )}
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardMeaning}>{words[currentIndex]?.meaning}</ThemedText>
                <ThemedText style={styles.cardHint}>Tap to see word</ThemedText>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Navigation buttons */}
      <View style={styles.navigationButtonsContainer}>
        <TouchableOpacity 
          style={[styles.navArrowButton, currentIndex === 0 && styles.navButtonDisabled]} 
          onPress={navigateToPreviousCard}
          disabled={currentIndex === 0}
        >
          <Ionicons 
            name="arrow-back-circle" 
            size={50} 
            color={currentIndex === 0 ? Colors.dark.tertiaryText : Colors.dark.systemBlue} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navArrowButton, currentIndex === words.length - 1 && styles.navButtonDisabled]} 
          onPress={navigateToNextCard}
          disabled={currentIndex === words.length - 1}
        >
          <Ionicons 
            name="arrow-forward-circle" 
            size={50} 
            color={currentIndex === words.length - 1 ? Colors.dark.tertiaryText : Colors.dark.systemBlue} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Word marking controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={toggleMastered}>
          <Ionicons
            name={words[currentIndex]?.mastered ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={words[currentIndex]?.mastered ? Colors.dark.systemGreen : Colors.dark.text}
          />
          <ThemedText style={styles.actionButtonText}>
            {words[currentIndex]?.mastered ? 'Mastered' : 'Mark as Mastered'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={toggleImportant}>
          <Ionicons
            name={words[currentIndex]?.important ? 'star' : 'star-outline'}
            size={24}
            color={words[currentIndex]?.important ? Colors.dark.systemYellow : Colors.dark.text}
          />
          <ThemedText style={styles.actionButtonText}>
            {words[currentIndex]?.important ? 'Important' : 'Mark as Important'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
  },
  spinIcon: {
    opacity: 0.8,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filtersScrollView: {
    paddingVertical: 8,
    gap: 8,
  },  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  filterOptionActive: {
    backgroundColor: Colors.dark.systemBlue,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterText: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  progressText: {
    fontSize: 16,
    opacity: 0.8,
    fontWeight: '500',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  cardAnimatedContainer: {
    width: '100%',
    maxWidth: 400,
    height: '100%',
    maxHeight: 500,
  },
  cardTouchable: {
    flex: 1,
  },  card: {
    flex: 1,
    borderRadius: 28,
    padding: 30,
    backgroundColor: Colors.dark.secondaryBackground,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardBack: {
    backgroundColor: Colors.dark.secondaryBackground,
    borderColor: 'rgba(120, 190, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    height: 24,
  },
  cardIcon: {
    marginLeft: 8,
  },  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cardWord: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardMeaning: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  cardHint: {
    position: 'absolute',
    bottom: 8,
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.3,
  },  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
    marginBottom: 28,
  },
  navArrowButton: {
    padding: 12,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },  
  emptySubText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: '90%',
  },
});

// Make sure to explicitly export the component as default
export default FlashcardsScreen;
