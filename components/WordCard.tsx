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
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { Word } from '@/services/wordService';
// Removing unused Image import

const SWIPE_THRESHOLD = 120;
const ROTATION_ANGLE = 15;

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
  overshootClamping: false,
};
const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
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
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
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

  const doneOpacity = useSharedValue(0);
  const reviewLaterOpacity = useSharedValue(0);
  
  // Memoize static style combinations to avoid recreating style arrays on each render
  const memoizedDislikeButtonStyle = useMemo(() => {
    return [
      styles.actionButton,
      styles.dislikeButton,
    ];
  }, []);
  
  const memoizedLikeButtonStyle = useMemo(() => {
    return [
      styles.actionButton,
      styles.likeButton,
    ];
  }, []);
  
  const memoizedBookmarkButtonStyle = useMemo(() => {
    return [
      styles.actionButton,
      styles.bookmarkButton,
    ];
  }, []);
  
  // Memoize decision label styles
  const memoizedDoneLabelStyle = useMemo(() => {
    return [styles.decisionLabel, styles.doneLabel];
  }, []);
  
  const memoizedReviewLaterLabelStyle = useMemo(() => {
    return [styles.decisionLabel, styles.reviewLaterLabel];
  }, []);

  // Dynamically update button styles based on pressed state
  const dislikeButtonFinalStyle = useMemo(() => {
    return pressedButton === 'dislike' 
      ? [...memoizedDislikeButtonStyle, styles.actionButtonPressed]
      : memoizedDislikeButtonStyle;
  }, [pressedButton, memoizedDislikeButtonStyle]);
  
  const likeButtonFinalStyle = useMemo(() => {
    return pressedButton === 'like' 
      ? [...memoizedLikeButtonStyle, styles.actionButtonPressed]
      : memoizedLikeButtonStyle;
  }, [pressedButton, memoizedLikeButtonStyle]);
  
  const bookmarkButtonFinalStyle = useMemo(() => {
    return pressedButton === 'bookmark' 
      ? [...memoizedBookmarkButtonStyle, styles.actionButtonPressed]
      : memoizedBookmarkButtonStyle;
  }, [pressedButton, memoizedBookmarkButtonStyle]);

  const cardStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      Extrapolate.CLAMP
    );

    
    const rotateY = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [5, 0, -5],
      Extrapolate.CLAMP
    );

    
    const shadowOpacity = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth / 4],
      [0.1, 0.25],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
        { rotateY: `${rotateY}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      shadowOpacity,
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

  
  const doneStyle = useAnimatedStyle(() => ({
    opacity: doneOpacity.value,
    transform: [
      { 
        scale: interpolate(
          doneOpacity.value, 
          [0, 1], 
          [0.8, 1], 
          Extrapolate.CLAMP
        ) 
      }
    ]
  }));

  const reviewLaterStyle = useAnimatedStyle(() => ({
    opacity: reviewLaterOpacity.value,
    transform: [
      { 
        scale: interpolate(
          reviewLaterOpacity.value, 
          [0, 1], 
          [0.8, 1], 
          Extrapolate.CLAMP
        ) 
      }
    ]
  }));

  // Store the current screen width in a shared value that can be accessed in gesture callbacks
  const screenWidthShared = useSharedValue(screenWidth);
  
  // Update the shared value when the actual screen width changes
  useEffect(() => {
    screenWidthShared.value = screenWidth;
  }, [screenWidth, screenWidthShared]);
  
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isActive)
        .onStart(() => {
          context.value.startX = translateX.value;
          context.value.startY = translateY.value;
          scale.value = withTiming(1.03, { duration: 200 });
        })
        .onUpdate((event) => {
          translateX.value = context.value.startX + event.translationX;
          translateY.value = context.value.startY + event.translationY;
          
          
          if (event.translationX > 50) {
            doneOpacity.value = withTiming(
              interpolate(
                event.translationX,
                [50, SWIPE_THRESHOLD],
                [0, 1],
                Extrapolate.CLAMP
              ),
              { duration: 100 }
            );
            reviewLaterOpacity.value = withTiming(0, { duration: 100 });
          } else if (event.translationX < -50) {
            reviewLaterOpacity.value = withTiming(
              interpolate(
                Math.abs(event.translationX),
                [50, SWIPE_THRESHOLD],
                [0, 1],
                Extrapolate.CLAMP
              ),
              { duration: 100 }
            );
            doneOpacity.value = withTiming(0, { duration: 100 });
          } else {
            doneOpacity.value = withTiming(0, { duration: 100 });
            reviewLaterOpacity.value = withTiming(0, { duration: 100 });
          }
          
          
          const direction = event.translationX > 0 ? 'right' : 'left';
          if (direction === 'right' && event.translationX > 50) {
            scaleLike.value = withTiming(1.1, { duration: 100 });
          } else if (direction === 'left' && event.translationX < -50) {
            scaleDislike.value = withTiming(1.1, { duration: 100 });
          } else {
            scaleLike.value = withTiming(1, { duration: 100 });
            scaleDislike.value = withTiming(1, { duration: 100 });
          }
        })
        .onEnd((event) => {
          scale.value = withTiming(1, { duration: 200 });
          doneOpacity.value = withTiming(0, { duration: 150 });
          reviewLaterOpacity.value = withTiming(0, { duration: 150 });
          
          if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
            const direction = event.translationX > 0 ? 'right' : 'left';
            
            
            opacity.value = withTiming(0, { duration: 300 });
            scale.value = withTiming(0.8, { duration: 300 });
            
            translateX.value = withSpring(
              Math.sign(event.translationX) * screenWidthShared.value * 1.5, 
              SPRING_CONFIG
            );
            translateY.value = withSpring(event.translationY, SPRING_CONFIG);
            
            
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
            runOnJS(onSwipe)(direction);
          } else {
            
            translateX.value = withSpring(0, SPRING_CONFIG);
            translateY.value = withSpring(0, SPRING_CONFIG);
            scaleLike.value = withTiming(1, { duration: 150 });
            scaleDislike.value = withTiming(1, { duration: 150 });
          }        }),
    [isActive, onSwipe, context.value, translateX, translateY, scale, doneOpacity, reviewLaterOpacity, opacity, scaleLike, scaleDislike, screenWidthShared.value]
  );

  
  useEffect(() => {
    if (isActive) {
      translateX.value = withSpring(0, SPRING_CONFIG);
      translateY.value = withSpring(0, SPRING_CONFIG);
      scaleBookmark.value = withTiming(1, TIMING_CONFIG);
      scale.value = withTiming(1, TIMING_CONFIG);
      opacity.value = withTiming(1, TIMING_CONFIG);
      doneOpacity.value = withTiming(0, TIMING_CONFIG);
      reviewLaterOpacity.value = withTiming(0, TIMING_CONFIG);
    }
  }, [isActive, translateX, translateY, scaleBookmark, scale, opacity, doneOpacity, reviewLaterOpacity]);

  const handleButtonPress = useCallback(
    (action: string) => {
      setPressedButton(action);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      switch (action) {
        case 'dislike':
          scaleDislike.value = withSequence(
            withTiming(1.3, { duration: 150 }),
            withTiming(1, { duration: 150 })
          );
          opacity.value = withTiming(0, { duration: 300 });
          scale.value = withTiming(0.8, { duration: 300 });
          translateX.value = withSpring(-screenWidth * 1.5, SPRING_CONFIG);
          reviewLaterOpacity.value = withTiming(1, { duration: 100 });
          setTimeout(() => {
            reviewLaterOpacity.value = withTiming(0, { duration: 100 });
            onSwipe('left');
          }, 200);
          break;
        case 'like':
          scaleLike.value = withSequence(
            withTiming(1.3, { duration: 150 }),
            withTiming(1, { duration: 150 })
          );
          opacity.value = withTiming(0, { duration: 300 });
          scale.value = withTiming(0.8, { duration: 300 });
          translateX.value = withSpring(screenWidth * 1.5, SPRING_CONFIG);
          doneOpacity.value = withTiming(1, { duration: 100 });
          setTimeout(() => {
            doneOpacity.value = withTiming(0, { duration: 100 });
            onSwipe('right');
          }, 200);
          break;
        case 'bookmark':
          scaleBookmark.value = withSequence(
            withTiming(1.3, { duration: 150 }),
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
      }    },
    [isBookmarked, addBookmark, removeBookmark, word, screenWidth, onSwipe, opacity, scale, translateX, doneOpacity, reviewLaterOpacity, scaleLike, scaleDislike, scaleBookmark]
  );

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Decision indicators */}
        <Animated.View style={[...memoizedDoneLabelStyle, doneStyle]}>
          <Text style={styles.decisionText}>DONE</Text>
        </Animated.View>
        
        <Animated.View style={[...memoizedReviewLaterLabelStyle, reviewLaterStyle]}>
          <Text style={styles.decisionText}>REVIEW LATER</Text>
        </Animated.View>
        
        <Text style={styles.wordText}>{word.word}</Text>
        <Text style={styles.meaningText}>{word.meaning}</Text>

        <View style={styles.actionButtonsContainer}>
          <Animated.View style={[styles.actionButtonWrapper, dislikeButtonStyle]}>
            <Pressable
              style={dislikeButtonFinalStyle}
              onPress={() => handleButtonPress('dislike')}
              disabled={!isActive}
            >
              <Ionicons name="close" size={30} color="#FF453A" />
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.actionButtonWrapper, bookmarkButtonStyle]}>
            <Pressable
              style={bookmarkButtonFinalStyle}
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
              style={likeButtonFinalStyle}
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

const styles = StyleSheet.create({
  card: {
    width: '90%',
    height: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1, 
    shadowRadius: 12,
    elevation: 8,
    position: 'absolute',
    
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  wordText: {
    fontSize: 36, 
    fontWeight: '500', 
    marginBottom: 24,
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
    maxWidth: '90%',
  },
  actionButtonsContainer: {
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
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  actionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  dislikeButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  likeButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(10, 132, 255, 0.2)',
  },
  bookmarkButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(50, 215, 75, 0.2)',
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  
  decisionLabel: {
    position: 'absolute',
    top: 45,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 3,
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
  },
  doneLabel: {
    borderColor: '#32D74B',
    right: 20,
  },
  reviewLaterLabel: {
    borderColor: '#FF453A',
    left: 20,
  },
  decisionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default WordCard;
