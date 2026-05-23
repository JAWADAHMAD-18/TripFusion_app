import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { PACKAGE_PLACEHOLDER_IMAGE_URI } from '@/constants/home';
import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';
import {
  cancelBooking as cancelBookingRequest,
  getBookingById,
  type Booking,
} from '@/services/bookingService';
import { confirmCancelBooking } from '@/utils/booking-cancel';
import { formatTravelDate } from '@/utils/booking-format';

function resolveId(id: string | string[] | undefined): string | undefined {
  if (typeof id === 'string') return id;
  if (Array.isArray(id) && id.length > 0) return id[0];
  return undefined;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>{value}</View>
    </View>
  );
}

function DetailSkeleton() {
  const opacity = useSharedValue(0.5);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true,
    );
  }, [opacity]);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.skeletonHero, animatedStyle]} />
      <Animated.View style={[styles.skeletonCard, animatedStyle]} />
      <Animated.View style={[styles.skeletonCard, animatedStyle]} />
    </View>
  );
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const bookingId = resolveId(rawId);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      setError('Invalid booking');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load booking';
      setError(message);
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const handleCancel = useCallback(() => {
    if (!booking) return;
    confirmCancelBooking((reason) => {
      setIsCancelling(true);
      void cancelBookingRequest(booking._id, reason)
        .then(() => router.back())
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to cancel booking';
          Alert.alert('Error', message);
        })
        .finally(() => setIsCancelling(false));
    });
  }, [booking, router]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !booking) {
    return (
      <View style={styles.screen}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error ?? 'Booking not found'}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadBooking()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const imageUri =
    booking.packageSnapshot?.images?.[0] ?? PACKAGE_PLACEHOLDER_IMAGE_URI;
  const showCancel =
    booking.bookingStatus === 'Pending' ||
    booking.bookingStatus === 'Confirmed';
  const snapshot = booking.packageSnapshot;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroWrap}>
          <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(10,26,68,0.2)', 'rgba(10,26,68,0.9)']}
            style={styles.heroGradient}
          />
          <Pressable
            style={styles.backButtonHero}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>
          <View style={styles.heroBadge}>
            <BookingStatusBadge status={booking.bookingStatus} />
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {snapshot?.title ?? 'Booking'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          <InfoRow
            label="Booking Code"
            value={
              <Text style={styles.codeValue}>{booking.bookingCode}</Text>
            }
          />
          <InfoRow
            label="Status"
            value={<BookingStatusBadge status={booking.bookingStatus} />}
          />
          <InfoRow
            label="Travel Date"
            value={
              <Text style={styles.infoValue}>
                {formatTravelDate(booking.travelDate)}
              </Text>
            }
          />
          <InfoRow
            label="Duration"
            value={
              <Text style={styles.infoValue}>
                {booking.durationDays}D / {booking.durationNights}N
              </Text>
            }
          />
          <InfoRow
            label="Travellers"
            value={
              <Text style={styles.infoValue}>{String(booking.numPeople)}</Text>
            }
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Package Details</Text>
          <InfoRow
            label="Destination"
            value={
              <Text style={styles.infoValue}>{snapshot?.destination ?? '—'}</Text>
            }
          />
          <InfoRow
            label="Category"
            value={
              <Text style={styles.infoValue}>{snapshot?.category ?? '—'}</Text>
            }
          />
          <InfoRow
            label="Trip Type"
            value={
              <Text style={styles.infoValue}>{snapshot?.tripType ?? '—'}</Text>
            }
          />
          {snapshot?.includes?.length ? (
            <View style={styles.listSection}>
              <Text style={styles.listHeading}>Includes</Text>
              {snapshot.includes.map((item) => (
                <Text key={`inc-${item}`} style={styles.includeItem}>
                  ✓ {item}
                </Text>
              ))}
            </View>
          ) : null}
          {snapshot?.excludes?.length ? (
            <View style={styles.listSection}>
              <Text style={styles.listHeading}>Excludes</Text>
              {snapshot.excludes.map((item) => (
                <Text key={`exc-${item}`} style={styles.excludeItem}>
                  ✗ {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <InfoRow
            label="Price per person"
            value={
              <Text style={styles.infoValue}>
                PKR {booking.pricePerPerson.toLocaleString('en-PK')}
              </Text>
            }
          />
          <InfoRow
            label="Number of people"
            value={
              <Text style={styles.infoValue}>{String(booking.numPeople)}</Text>
            }
          />
          <View style={styles.divider} />
          <InfoRow
            label="Total Price"
            value={
              <Text style={styles.totalValue}>
                PKR {booking.totalPrice.toLocaleString('en-PK')}
              </Text>
            }
          />
          {booking.savings > 0 ? (
            <Text style={styles.savings}>
              You saved PKR {booking.savings.toLocaleString('en-PK')} 🎉
            </Text>
          ) : null}
        </View>

        {showCancel ? (
          <Pressable
            style={styles.cancelBookingButton}
            onPress={handleCancel}
            disabled={isCancelling}
            accessibilityRole="button"
            accessibilityLabel="Cancel booking"
          >
            {isCancelling ? (
              <ActivityIndicator color={colors.error.main} />
            ) : (
              <Text style={styles.cancelBookingText}>Cancel Booking</Text>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroWrap: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    paddingTop: 52,
    paddingLeft: spacing.lg,
  },
  backButtonHero: {
    position: 'absolute',
    top: 52,
    left: spacing.lg,
    zIndex: 2,
    width: spacing.xxxl + spacing.sm,
    height: spacing.xxxl + spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heroBadge: {
    position: 'absolute',
    top: 52,
    right: spacing.lg,
    zIndex: 2,
  },
  heroTitle: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    color: colors.text.light,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    margin: spacing.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    flex: 1,
  },
  infoValueWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: fontSizes.sm,
    fontWeight: '500',
    textAlign: 'right',
  },
  codeValue: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
  listSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  listHeading: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  includeItem: {
    color: colors.success.main,
    fontSize: fontSizes.sm,
  },
  excludeItem: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  totalValue: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    textAlign: 'right',
  },
  savings: {
    color: colors.success.main,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  cancelBookingButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error.main,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  cancelBookingText: {
    color: colors.error.main,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  errorText: {
    color: colors.error.main,
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  skeletonHero: {
    height: 280,
    backgroundColor: colors.border.light,
  },
  skeletonCard: {
    height: 160,
    margin: spacing.lg,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
  },
});
