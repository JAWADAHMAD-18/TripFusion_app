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
import type { PackageDetail } from '@/types/package';
import { PackageSectionCard } from '@/components/package-detail/package-section-card';

type GridItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

type PackageDetailsGridProps = {
  packageDetail: PackageDetail;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

function buildGridItems(detail: PackageDetail): GridItem[] {
  const items: GridItem[] = [];

  if (detail.duration) {
    items.push({
      key: 'duration',
      icon: 'time-outline',
      label: 'Duration',
      value: detail.duration,
    });
  }
  if (detail.durationDays != null) {
    items.push({
      key: 'days',
      icon: 'sunny-outline',
      label: 'Days',
      value: `${detail.durationDays} days`,
    });
  }
  if (detail.durationNights != null) {
    items.push({
      key: 'nights',
      icon: 'moon-outline',
      label: 'Nights',
      value: `${detail.durationNights} nights`,
    });
  }
  if (detail.category) {
    items.push({
      key: 'category',
      icon: 'pricetag-outline',
      label: 'Category',
      value: detail.category,
    });
  }
  if (detail.tripType) {
    items.push({
      key: 'trip',
      icon: 'airplane-outline',
      label: 'Trip Type',
      value: detail.tripType,
    });
  }
  items.push({
    key: 'slots',
    icon: 'people-outline',
    label: 'Slots Left',
    value: detail.availableSlot > 0 ? `${detail.availableSlot}` : 'None',
  });

  return items;
}

export function PackageDetailsGrid({
  packageDetail,
  animatedStyle,
}: PackageDetailsGridProps) {
  const items = buildGridItems(packageDetail);
  if (items.length === 0) return null;

  return (
    <PackageSectionCard title="Trip Details" animatedStyle={animatedStyle}>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.key} style={styles.cell}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={item.icon}
                size={fontSizes.lg}
                color={colors.accent.teal}
              />
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value} numberOfLines={2}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </PackageSectionCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    width: '47%',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconWrap: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  value: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
});
