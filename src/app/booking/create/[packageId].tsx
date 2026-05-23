import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookingErrorState } from '@/components/booking/booking-error-state';
import { BookingMessageInput } from '@/components/booking/booking-message-input';
import { BookingPackageSummaryCard } from '@/components/booking/booking-package-summary-card';
import { BookingPaymentProof } from '@/components/booking/booking-payment-proof';
import { BookingSeatSelector } from '@/components/booking/booking-seat-selector';
import { BookingSkeleton } from '@/components/booking/booking-skeleton';
import { BookingSuccessOverlay } from '@/components/booking/booking-success-overlay';
import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  shadows,
  spacing,
} from '@/constants/theme';
import { useBooking } from '@/hooks/use-booking';
import { useButtonPressAnimation, useFadeUpAnimation } from '@/utils/animations';

function resolvePackageId(
  packageId: string | string[] | undefined,
): string | undefined {
  if (typeof packageId === 'string') return packageId;
  if (Array.isArray(packageId) && packageId.length > 0) return packageId[0];
  return undefined;
}

function formatTotal(price: number, seats: number): string {
  return `PKR ${(price * seats).toLocaleString('en-PK')}`;
}

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { packageId: rawPackageId } = useLocalSearchParams<{ packageId: string }>();
  const packageId = resolvePackageId(rawPackageId);

  const {
    packageSummary,
    seats,
    maxSeats,
    message,
    setMessage,
    paymentProof,
    isLoadingPackage,
    isSubmitting,
    error,
    submitError,
    showSuccess,
    successCode,
    canSubmit,
    incrementSeats,
    decrementSeats,
    pickPaymentProof,
    removePaymentProof,
    submitBooking,
    refetchPackage,
  } = useBooking(packageId);

  const screenStyle = useFadeUpAnimation();
  const summaryStyle = useFadeUpAnimation(80);
  const seatsStyle = useFadeUpAnimation(160);
  const messageStyle = useFadeUpAnimation(240);
  const paymentStyle = useFadeUpAnimation(320);
  const { animatedStyle: buttonPressStyle, onPressIn, onPressOut } =
    useButtonPressAnimation();

  if (isLoadingPackage) {
    return <BookingSkeleton />;
  }

  if (error || !packageSummary) {
    return (
      <BookingErrorState
        message={error ?? 'Package not found.'}
        onRetry={refetchPackage}
        onBack={() => router.back()}
      />
    );
  }

  const estimatedTotal = formatTotal(packageSummary.price, seats);

  return (
    <View style={styles.screen}>
      {showSuccess ? <BookingSuccessOverlay bookingCode={successCode} /> : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.xxl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.inner, screenStyle]}>
            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="chevron-back"
                  size={fontSizes.xl}
                  color={colors.primary}
                />
              </Pressable>
              <View style={styles.headerTextWrap}>
                <Text style={styles.screenTitle}>Complete booking</Text>
                <Text style={styles.screenSubtitle}>
                  Review your trip and upload payment proof
                </Text>
              </View>
            </View>

            <BookingPackageSummaryCard
              summary={packageSummary}
              animatedStyle={summaryStyle}
            />

            <View style={styles.sections}>
              <BookingSeatSelector
                seats={seats}
                maxSeats={maxSeats}
                onIncrement={incrementSeats}
                onDecrement={decrementSeats}
                animatedStyle={seatsStyle}
              />
              <BookingMessageInput
                value={message}
                onChangeText={setMessage}
                animatedStyle={messageStyle}
              />
              <BookingPaymentProof
                paymentProof={paymentProof}
                onPick={pickPaymentProof}
                onRemove={removePaymentProof}
                animatedStyle={paymentStyle}
              />
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated total</Text>
              <Text style={styles.totalValue}>{estimatedTotal}</Text>
            </View>

            {submitError ? (
              <Text style={styles.submitError}>{submitError}</Text>
            ) : null}

            <Animated.View style={buttonPressStyle}>
              <Pressable
                onPress={submitBooking}
                onPressIn={canSubmit ? onPressIn : undefined}
                onPressOut={canSubmit ? onPressOut : undefined}
                disabled={!canSubmit || isSubmitting}
                style={[
                  styles.submitWrap,
                  (!canSubmit || isSubmitting) && styles.submitDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    canSubmit
                      ? gradients.tealAccent.colors
                      : [colors.border.dark, colors.text.muted]
                  }
                  start={gradients.tealAccent.start}
                  end={gradients.tealAccent.end}
                  style={styles.submitButton}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.text.light} />
                  ) : (
                    <Text style={styles.submitText}>
                      {canSubmit ? 'Book Now' : 'Upload payment proof to continue'}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  inner: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: spacing.xxxl + spacing.sm,
    height: spacing.xxxl + spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTextWrap: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  screenTitle: {
    color: colors.primary,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
  },
  screenSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  sections: {
    gap: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  totalLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  totalValue: {
    color: colors.accent.teal,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  submitError: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  submitWrap: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  submitDisabled: {
    opacity: 0.75,
  },
  submitButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  submitText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
