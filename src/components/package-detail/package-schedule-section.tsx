import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';
import { PackageSectionCard } from '@/components/package-detail/package-section-card';

type PackageScheduleSectionProps = {
  startDate: string | null;
  endDate: string | null;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

function formatDisplayDate(iso: string | null): string {
  if (!iso) return 'TBD';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function PackageScheduleSection({
  startDate,
  endDate,
  animatedStyle,
}: PackageScheduleSectionProps) {
  if (!startDate && !endDate) return null;

  return (
    <PackageSectionCard title="Schedule" animatedStyle={animatedStyle}>
      <View style={styles.timeline}>
        <View style={styles.line} />
        <View style={styles.nodeBlock}>
          <View style={[styles.node, styles.nodeStart]}>
            <Ionicons name="airplane" size={fontSizes.sm} color={colors.text.light} />
          </View>
          <View style={styles.nodeContent}>
            <Text style={styles.nodeLabel}>Departure</Text>
            <Text style={styles.nodeDate}>{formatDisplayDate(startDate)}</Text>
          </View>
        </View>
        <View style={styles.nodeBlock}>
          <View style={[styles.node, styles.nodeEnd]}>
            <Ionicons name="flag" size={fontSizes.sm} color={colors.text.light} />
          </View>
          <View style={styles.nodeContent}>
            <Text style={styles.nodeLabel}>Return</Text>
            <Text style={styles.nodeDate}>{formatDisplayDate(endDate)}</Text>
          </View>
        </View>
      </View>
    </PackageSectionCard>
  );
}

const styles = StyleSheet.create({
  timeline: {
    position: 'relative',
    paddingLeft: spacing.sm,
    gap: spacing.xl,
  },
  line: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.lg,
    bottom: spacing.lg,
    width: 2,
    backgroundColor: colors.border.medium,
  },
  nodeBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  node: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  nodeStart: {
    backgroundColor: colors.accent.teal,
  },
  nodeEnd: {
    backgroundColor: colors.primary,
  },
  nodeContent: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  nodeLabel: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nodeDate: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
