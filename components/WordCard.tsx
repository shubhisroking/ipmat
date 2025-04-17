import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useBookmarkStore } from '@/store/bookmarkStore';

const SWIPE_THRESHOLD = 120;
const ROTATION_ANGLE = 15;

type Word = {
  id: number;
  word: string;
  meaning: string;
};

type WordCardProps = {
  word: Word;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
};

const WordCard: React.FC<WordCardProps> = ({ word, onSwipe, isActive }) => {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const context = useSharedValue({ startX: 0, startY: 0 });
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  
  const isBookmarked = useBookmarkStore(
    useCallback((state) => state.isBookmarked(word.id), [word.id])
  );

  const addBookmark = useBookmarkStore(
    useCallback((state) => state.addBookmark, [])
  );

  const removeBookmark = useBookmarkStore(
    useCallback((state) => state.removeBookmark, [])
  );

  const scaleDislike = useSharedValue(1);
  const scaleLike = useSharedValue(1);
  const scaleBookmark = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
      ],
    };
  });

  const dislikeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleDislike.value }],
  }));

  const likeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleLike.value }],
  }));

  const bookmarkButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleBookmark.value }],
  }));

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isActive)
        .onStart(() => {
          context.value.startX = translateX.value;
          context.value.startY = translateY.value;
        })
        .onUpdate((event) => {
          translateX.value = context.value.startX + event.translationX;
          translateY.value = context.value.startY + event.translationY;
        })
        .onEnd((event) => {
          if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
            const direction = event.translationX > 0 ? 'right' : 'left';
            translateX.value = withSpring(Math.sign(event.translationX) * screenWidth * 1.5, {
              damping: 100,
              stiffness: 100,
            });
            translateY.value = withSpring(event.translationY, { damping: 100, stiffness: 100 });
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
            runOnJS(onSwipe)(direction);
          } else {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
          }
        }),
    [isActive, screenWidth, onSwipe]
  );

  useEffect(() => {
    if (isActive) {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scaleBookmark.value = withTiming(1);
    }
  }, [isActive, translateX, translateY, scaleBookmark]);

  const handleButtonPress = useCallback(
    (action: string) => {
      setPressedButton(action);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      switch (action) {
        case 'dislike':
          scaleDislike.value = withSequence(
            withTiming(1.2, { duration: 150 }),
            withTiming(1, { duration: 150 })
          );
          translateX.value = withSpring(-screenWidth * 1.5, { damping: 100, stiffness: 100 });
          setTimeout(() => onSwipe('left'), 300);
          break;
        case 'like':
          scaleLike.value = withSequence(
            withTiming(1.2, { duration: 150 }),
            withTiming(1, { duration: 150 })
          );
          translateX.value = withSpring(screenWidth * 1.5, { damping: 100, stiffness: 100 });
          setTimeout(() => onSwipe('right'), 300);
          break;
        case 'bookmark':
          scaleBookmark.value = withSequence(
            withTiming(1.2, { duration: 150 }),
            withTiming(1, { duration: 150 })
          );
          if (isBookmarked) {
            removeBookmark(word.id);
          } else {
            addBookmark(word);
          }
          break;
      }

      if (action !== 'bookmark') {
        setTimeout(() => setPressedButton(null), 300);
      } else {
        setTimeout(() => setPressedButton(null), 150);
      }
    },
    [isBookmarked, addBookmark, removeBookmark, word, screenWidth, onSwipe]
  );

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.wordText}>{word.word}</Text>
        <Text style={styles.meaningText}>{word.meaning}</Text>

        <View style={styles.actionButtonsContainer}>
          <Animated.View style={[styles.actionButtonWrapper, dislikeButtonStyle]}>
            <Pressable
              style={[
                styles.actionButton,
                styles.dislikeButton,
                pressedButton === 'dislike' && styles.actionButtonPressed,
              ]}
              onPress={() => handleButtonPress('dislike')}
              disabled={!isActive}
            >
              <Ionicons name="close" size={30} color="#FF453A" />
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.actionButtonWrapper, bookmarkButtonStyle]}>
            <Pressable
              style={[
                styles.actionButton,
                styles.bookmarkButton,
                pressedButton === 'bookmark' && styles.actionButtonPressed,
              ]}
              onPress={() => handleButtonPress('bookmark')}
              disabled={!isActive}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={26}
                color={isBookmarked ? '#32D74B' : '#8E8E93'}
              />
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.actionButtonWrapper, likeButtonStyle]}>
            <Pressable
              style={[
                styles.actionButton,
                styles.likeButton,
                pressedButton === 'like' && styles.actionButtonPressed,
              ]}
              onPress={() => handleButtonPress('like')}
              disabled={!isActive}
            >
              <Ionicons name="heart" size={26} color="#0A84FF" />
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({  card: {
    width: '90%',
    height: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    elevation: 4,
    position: 'absolute', 
  },
  wordText: {
    fontSize: 36, 
    fontWeight: '500', 
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
    letterSpacing: -0.5, 
  },
  meaningText: {
    fontSize: 18, 
    textAlign: 'center',
    color: '#3C3C43',
    opacity: 0.8,
    lineHeight: 26, 
    letterSpacing: -0.2, 
  },  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '80%',
    transform: [{ translateY: 30 }],
  },
  actionButtonWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  dislikeButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  likeButton: {
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.2)',
  },
  bookmarkButton: {
    borderWidth: 1,
    borderColor: 'rgba(50, 215, 75, 0.2)',
    
    
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
});

export default WordCard;
