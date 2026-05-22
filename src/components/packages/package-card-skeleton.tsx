import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePulseOpacity } from '@/hooks/use-pulse-opacity';
import { borderRadius, colors, spacing } from '@/constants/theme';

export function PackageCardSkeleton() {
  const pulseStyle = usePulseOpacity();

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, pulseStyle]} />
      <View style={styles.body}>
        <Animated.View style={[styles.lineTitle, pulseStyle]} />
        <Animated.View style={[styles.lineMeta, pulseStyle]} />
        <Animated.View style={[styles.lineSummary, pulseStyle]} />
        <View style={styles.tagRow}>
          <Animated.View style={[styles.tag, pulseStyle]} />
          <Animated.View style={[styles.tag, pulseStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    height: 120,
    backgroundColor: colors.border.light,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  lineTitle: {
    height: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border.light,
  },
  lineMeta: {
    height: spacing.md,
    width: '70%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.border.light,
  },
  lineSummary: {
    height: spacing.xl,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border.light,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    width: 48,
    height: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
  },
});
