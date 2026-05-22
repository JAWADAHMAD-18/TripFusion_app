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

type PackageHighlightsSectionProps = {
  highlights: string[];
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

export function PackageHighlightsSection({
  highlights,
  animatedStyle,
}: PackageHighlightsSectionProps) {
  if (highlights.length === 0) return null;

  return (
    <PackageSectionCard title="Trip Highlights" animatedStyle={animatedStyle}>
      <View style={styles.chipsWrap}>
        {highlights.map((item) => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipBullet}>✦</Text>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>
    </PackageSectionCard>
  );
}

const styles = StyleSheet.create({
  chipsWrap: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  chipBullet: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs / 2,
  },
  chipText: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.lg,
    fontWeight: '500',
  },
});
