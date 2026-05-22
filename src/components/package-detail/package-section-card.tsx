import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';
import { useCardPressAnimation } from '@/utils/animations';

type PackageSectionCardProps = {
  title?: string;
  children: ReactNode;
  animatedStyle?: AnimatedStyle<ViewStyle>;
  onPress?: () => void;
};

export function PackageSectionCard({
  title,
  children,
  animatedStyle,
  onPress,
}: PackageSectionCardProps) {
  const { animatedStyle: pressStyle, onPressIn, onPressOut } =
    useCardPressAnimation();

  const content = (
    <Animated.View style={[styles.card, animatedStyle, onPress && pressStyle]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </Animated.View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.xl,
    ...shadows.md,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});
