import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';
import { useFadeInAnimation } from '@/utils/animations';

type BookingSuccessOverlayProps = {
  bookingCode: string | null;
};

export function BookingSuccessOverlay({ bookingCode }: BookingSuccessOverlayProps) {
  const fadeStyle = useFadeInAnimation(0, 300);
  const slideStyle = useFadeInAnimation(100, 450);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.toast, fadeStyle]}>
        <Text style={styles.emoji}>✓</Text>
        <Animated.View style={slideStyle}>
          <Text style={styles.title}>Booking confirmed!</Text>
          {bookingCode ? (
            <Text style={styles.code}>Ref: {bookingCode}</Text>
          ) : null}
          <Text style={styles.subtitle}>Taking you home...</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface.navbar,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  toast: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.lg,
    maxWidth: '85%',
  },
  emoji: {
    fontSize: fontSizes.display,
    color: colors.success.main,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  code: {
    color: colors.accent.teal,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
