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

type PackageAvailabilitySectionProps = {
  packageDetail: PackageDetail;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

export function PackageAvailabilitySection({
  packageDetail,
  animatedStyle,
}: PackageAvailabilitySectionProps) {
  const isAvailable = packageDetail.bookable;
  const statusColor = isAvailable ? colors.success.main : colors.error.main;
  const statusBg = isAvailable ? colors.success.light : colors.error.light;
  const statusText = isAvailable ? 'Available' : 'Sold Out';
  const statusIcon = isAvailable ? 'checkmark-circle' : 'close-circle';

  return (
    <PackageSectionCard title="Availability" animatedStyle={animatedStyle}>
      <View style={[styles.badge, { backgroundColor: statusBg }]}>
        <Ionicons name={statusIcon} size={fontSizes.xl} color={statusColor} />
        <View style={styles.badgeTextWrap}>
          <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
          <Text style={styles.subtext}>
            {isAvailable
              ? `${packageDetail.availableSlot} spots remaining for this departure`
              : 'This package is currently unavailable for booking'}
          </Text>
        </View>
      </View>
      <View style={styles.indicators}>
        <View style={styles.indicatorRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: packageDetail.available
                  ? colors.success.main
                  : colors.error.main,
              },
            ]}
          />
          <Text style={styles.indicatorLabel}>
            Package status: {packageDetail.available ? 'Open' : 'Closed'}
          </Text>
        </View>
        <View style={styles.indicatorRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  packageDetail.availableSlot > 0
                    ? colors.accent.teal
                    : colors.warning.main,
              },
            ]}
          />
          <Text style={styles.indicatorLabel}>
            Slots: {packageDetail.availableSlot > 0 ? packageDetail.availableSlot : 'Full'}
          </Text>
        </View>
      </View>
    </PackageSectionCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  badgeTextWrap: {
    flex: 1,
  },
  status: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  subtext: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    lineHeight: fontSizes.lg,
  },
  indicators: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: borderRadius.full,
  },
  indicatorLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
});
