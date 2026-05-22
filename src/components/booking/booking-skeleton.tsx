import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePulseOpacity } from '@/hooks/use-pulse-opacity';
import { borderRadius, colors, spacing } from '@/constants/theme';

export function BookingSkeleton() {
  const insets = useSafeAreaInsets();
  const pulseStyle = usePulseOpacity();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.lineShort, pulseStyle]} />
      <Animated.View style={[styles.summaryCard, pulseStyle]} />
      <Animated.View style={[styles.card, pulseStyle]} />
      <Animated.View style={[styles.card, pulseStyle]} />
      <Animated.View style={[styles.cardTall, pulseStyle]} />
      <Animated.View style={[styles.submitBar, pulseStyle]} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  lineShort: {
    height: spacing.xxl,
    width: '50%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.border.light,
  },
  summaryCard: {
    height: 120,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
  },
  card: {
    height: 140,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
  },
  cardTall: {
    height: 220,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
  },
  submitBar: {
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.border.light,
    marginTop: spacing.md,
  },
});
