import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { PACKAGE_PLACEHOLDER_IMAGE_URI } from '@/constants/home';
import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';
import type { Booking } from '@/services/bookingService';
import { confirmCancelBooking } from '@/utils/booking-cancel';
import { formatTravelDate } from '@/utils/booking-format';

const FALLBACK_IMAGE = PACKAGE_PLACEHOLDER_IMAGE_URI;

type BookingCardProps = {
  booking: Booking;
  onCancel: (id: string, reason: string) => Promise<void>;
};

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const router = useRouter();
  const imageUri =
    booking.packageSnapshot?.images?.[0] ?? FALLBACK_IMAGE;
  const showActions =
    booking.bookingStatus === 'Pending' ||
    booking.bookingStatus === 'Confirmed';
  const showCancel = booking.bookingStatus === 'Pending';

  const handleViewDetails = () => {
    router.push(`/booking/${booking._id}`);
  };

  const handleCancelPress = () => {
    confirmCancelBooking((reason) => {
      void onCancel(booking._id, reason).catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to cancel booking';
        Alert.alert('Error', message);
      });
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(10,26,68,0.85)']}
          style={styles.imageGradient}
        />
        <Text style={styles.imageTitle} numberOfLines={2}>
          {booking.packageSnapshot?.title ?? 'Trip'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.metaText} numberOfLines={1}>
            📍 {booking.packageSnapshot?.destination ?? '—'}
          </Text>
          <BookingStatusBadge status={booking.bookingStatus} />
        </View>

        <View style={[styles.row, styles.rowSpaced]}>
          <Text style={styles.metaText}>
            👥 {booking.numPeople} travellers
          </Text>
          <Text style={styles.price}>
            PKR {booking.totalPrice.toLocaleString('en-PK')}
          </Text>
        </View>

        <View style={[styles.row, styles.rowTight]}>
          <Text style={styles.mutedText}>
            📅 {formatTravelDate(booking.travelDate)}
          </Text>
          <Text style={styles.mutedText}>{booking.bookingCode}</Text>
        </View>

        {showActions ? (
          <View style={styles.actions}>
            <Pressable
              style={styles.viewButton}
              onPress={handleViewDetails}
              accessibilityRole="button"
              accessibilityLabel="View booking details"
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </Pressable>
            {showCancel ? (
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelPress}
                accessibilityRole="button"
                accessibilityLabel="Cancel booking"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageWrap: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageTitle: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    color: colors.text.light,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowSpaced: {
    marginTop: spacing.sm,
  },
  rowTight: {
    marginTop: spacing.xs,
  },
  metaText: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
  },
  price: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  mutedText: {
    flex: 1,
    color: colors.text.muted,
    fontSize: fontSizes.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  viewButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  viewButtonText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.error.main,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
