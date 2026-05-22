import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';

type BookingMessageInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

export function BookingMessageInput({
  value,
  onChangeText,
  animatedStyle,
}: BookingMessageInputProps) {
  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Text style={styles.label}>Message to TripFusion</Text>
      <Text style={styles.hint}>Optional notes for your booking (seating, timing, etc.)</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Add a message for our team..."
        placeholderTextColor={colors.text.muted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.xl,
  },
  label: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  hint: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 100,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    color: colors.primary,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.xl,
  },
});
