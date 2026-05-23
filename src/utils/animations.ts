import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const FADE_DURATION = 400;

export function useFadeUpAnimation(_delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  useEffect(() => {
    opacity.value = withTiming(1, { duration: FADE_DURATION });
    translateY.value = withTiming(0, { duration: FADE_DURATION });
  }, []);
  return animatedStyle;
}

export function useStaggerAnimation(index: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      opacity.value = withTiming(1, { duration: FADE_DURATION });
      translateY.value = withTiming(0, { duration: FADE_DURATION });
    }, index * 80);

    return () => clearTimeout(timeoutId);
  }, []);
  return animatedStyle;
}

export function useFadeInAnimation(delay = 0, duration = FADE_DURATION) {
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  useEffect(() => {
    opacity.value = withTiming(1, { duration, delay });
  }, [delay, duration, opacity]);
  return animatedStyle;
}

export function useCardPressAnimation() {
  return useButtonPressAnimation();
}

export function useButtonPressAnimation() {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => {
    scale.value = withSpring(0.96);
  };
  const onPressOut = () => {
    scale.value = withSpring(1);
  };
  return { animatedStyle, onPressIn, onPressOut };
}

/** @deprecated Use useButtonPressAnimation instead */
export const buttonPressAnimation = useButtonPressAnimation;
