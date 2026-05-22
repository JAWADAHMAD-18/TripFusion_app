import { StyleSheet, Text } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';

import { colors, fontSizes, spacing } from '@/constants/theme';
import { PackageSectionCard } from '@/components/package-detail/package-section-card';

type PackageDetailOverviewProps = {
  description: string;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

export function PackageDetailOverview({
  description,
  animatedStyle,
}: PackageDetailOverviewProps) {
  if (!description.trim()) return null;

  return (
    <PackageSectionCard title="Quick Overview" animatedStyle={animatedStyle}>
      <Text style={styles.body}>{description}</Text>
    </PackageSectionCard>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.text.secondary,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.xl + 4,
    letterSpacing: 0.2,
  },
});
