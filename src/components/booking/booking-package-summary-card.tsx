import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import { PACKAGE_PLACEHOLDER_IMAGE_URI } from '@/constants/home';
import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';
import type { BookingPackageSummary } from '@/types/booking';

type BookingPackageSummaryCardProps = {
  summary: BookingPackageSummary;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

function formatPrice(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`;
}

export function BookingPackageSummaryCard({
  summary,
  animatedStyle,
}: BookingPackageSummaryCardProps) {
  const imageUri = summary.thumbnail || PACKAGE_PLACEHOLDER_IMAGE_URI;

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {summary.title}
        </Text>
        <View style={styles.row}>
          <Ionicons
            name="location-outline"
            size={fontSizes.sm}
            color={colors.accent.teal}
          />
          <Text style={styles.meta} numberOfLines={1}>
            {summary.location}
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.row}>
            <Ionicons
              name="time-outline"
              size={fontSizes.sm}
              color={colors.text.secondary}
            />
            <Text style={styles.meta}>{summary.duration}</Text>
          </View>
          <Text style={styles.price}>{formatPrice(summary.price)}</Text>
        </View>
        <View style={styles.slotsBadge}>
          <Text style={styles.slotsText}>
            {summary.availableSlot > 0
              ? `${summary.availableSlot} slots available`
              : 'No slots available'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    ...shadows.md,
  },
  image: {
    width: 108,
    height: '100%',
    minHeight: 120,
    backgroundColor: colors.border.light,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  price: {
    color: colors.accent.teal,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  slotsBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.success.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  slotsText: {
    color: colors.success.dark,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
