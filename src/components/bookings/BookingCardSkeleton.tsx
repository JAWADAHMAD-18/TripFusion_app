import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  shadows,
  spacing,
} from '@/constants/theme';

const IMAGE_HEIGHT = 120;
const SKELETON_COUNT = 3;

function SkeletonCard() {
  const opacity = useSharedValue(0.5);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true,
    );
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.imageBlock} />
      <View style={styles.content}>
        <View style={styles.lineWide} />
        <View style={styles.lineMedium} />
        <View style={styles.lineShort} />
      </View>
    </Animated.View>
  );
}

export function BookingCardSkeletonList() {
  return (
    <>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <SkeletonCard key={`booking-skeleton-${index}`} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.xxl,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageBlock: {
    height: IMAGE_HEIGHT,
    backgroundColor: colors.border.medium,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lineWide: {
    height: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border.medium,
    width: '85%',
  },
  lineMedium: {
    height: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border.medium,
    width: '65%',
  },
  lineShort: {
    height: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border.medium,
    width: '40%',
  },
});
