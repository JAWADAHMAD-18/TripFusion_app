import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const FADE_DURATION = 400;
const FADE_OFFSET_Y = 20;
const STAGGER_STEP_MS = 80;

export function useFadeUpAnimation(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(FADE_OFFSET_Y);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: FADE_DURATION, delay });
    translateY.value = withTiming(0, { duration: FADE_DURATION, delay });
  }, [delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export function useStaggerAnimation(index: number) {
  return useFadeUpAnimation(index * STAGGER_STEP_MS);
}

export function buttonPressAnimation() {
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
