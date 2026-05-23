import { StyleSheet, Text, View } from 'react-native';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';
import type { BookingStatus } from '@/services/bookingService';

type StatusTheme = {
  backgroundColor: string;
  color: string;
};

function getStatusTheme(status: BookingStatus): StatusTheme {
  switch (status) {
    case 'Pending':
      return {
        backgroundColor: colors.warning.light,
        color: colors.warning.dark,
      };
    case 'Confirmed':
      return {
        backgroundColor: colors.success.light,
        color: colors.success.dark,
      };
    case 'Cancelled':
      return {
        backgroundColor: colors.error.light,
        color: colors.error.dark,
      };
    case 'Completed':
      return {
        backgroundColor: colors.surface.tabIconActiveGlow,
        color: colors.accent.teal,
      };
    default:
      return {
        backgroundColor: colors.border.light,
        color: colors.text.secondary,
      };
  }
}

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const theme = getStatusTheme(status);
  return (
    <View style={[styles.badge, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.text, { color: theme.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
