import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

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

  const cardStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
      ],
    };
  });

  const panGesture = Gesture.Pan()
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
        translateX.value = withSpring(Math.sign(event.translationX) * screenWidth * 1.5, { damping: 100, stiffness: 100 });
        translateY.value = withSpring(event.translationY, { damping: 100, stiffness: 100 }); 
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });
  useEffect(() => {
    if (isActive) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
    }
  }, [isActive, translateX, translateY]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.wordText}>{word.word}</Text>
        <Text style={styles.meaningText}>{word.meaning}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
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
  },
});

export default WordCard;
