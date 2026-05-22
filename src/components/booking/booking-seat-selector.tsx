import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';

type BookingSeatSelectorProps = {
  seats: number;
  maxSeats: number;
  onIncrement: () => void;
  onDecrement: () => void;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

export function BookingSeatSelector({
  seats,
  maxSeats,
  onIncrement,
  onDecrement,
  animatedStyle,
}: BookingSeatSelectorProps) {
  const atMin = seats <= 1;
  const atMax = seats >= maxSeats;

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Text style={styles.label}>Number of seats</Text>
      <Text style={styles.hint}>Minimum 1 · Maximum {maxSeats}</Text>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, atMin && styles.buttonDisabled]}
          onPress={onDecrement}
          disabled={atMin}
          accessibilityLabel="Decrease seats"
        >
          <Ionicons
            name="remove"
            size={fontSizes.xl}
            color={atMin ? colors.text.muted : colors.primary}
          />
        </Pressable>
        <View style={styles.valueWrap}>
          <Text style={styles.value}>{seats}</Text>
          <Text style={styles.valueLabel}>
            {seats === 1 ? 'seat' : 'seats'}
          </Text>
        </View>
        <Pressable
          style={[styles.button, atMax && styles.buttonDisabled]}
          onPress={onIncrement}
          disabled={atMax}
          accessibilityLabel="Increase seats"
        >
          <Ionicons
            name="add"
            size={fontSizes.xl}
            color={atMax ? colors.text.muted : colors.primary}
          />
        </Pressable>
      </View>
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
    marginBottom: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    width: spacing.huge,
    height: spacing.huge,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  valueWrap: {
    alignItems: 'center',
  },
  value: {
    color: colors.primary,
    fontSize: fontSizes.xxxl,
    fontWeight: '700',
  },
  valueLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
  },
});
