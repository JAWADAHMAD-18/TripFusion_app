import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function usePulseOpacity(duration = 800, minOpacity = 0.4) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(minOpacity, { duration }),
      -1,
      true,
    );
  }, [duration, minOpacity, opacity]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
}
