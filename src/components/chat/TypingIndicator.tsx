import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';

interface AnimatedDotProps {
  delay: number;
}

const AnimatedDot: React.FC<AnimatedDotProps> = ({ delay }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false, // do not reverse sequence, sequence is -6 -> 0, loop it
      ),
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export const TypingIndicator: React.FC = () => {
  return (
    <View style={styles.botRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>AI</Text>
      </View>
      <View style={styles.botBubble}>
        <View style={styles.dotRow}>
          <AnimatedDot delay={0} />
          <AnimatedDot delay={150} />
          <AnimatedDot delay={300} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  botRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginRight: '20%',
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text.light,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  botBubble: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderBottomLeftRadius: borderRadius.sm,
    padding: spacing.lg,
    justifyContent: 'center',
    ...shadows.sm,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted,
    marginHorizontal: 3,
  },
});
