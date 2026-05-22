import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PACKAGE_DETAIL_BOOK_BAR_HEIGHT } from '@/constants/home';
import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  shadows,
  spacing,
} from '@/constants/theme';
import { buttonPressAnimation, useFadeInAnimation } from '@/utils/animations';

type PackageDetailBookBarProps = {
  priceLabel: string;
  visible: boolean;
  bookable: boolean;
  availabilityLabel: string;
  onBookPress: () => void;
};

export function PackageDetailBookBar({
  priceLabel,
  visible,
  bookable,
  availabilityLabel,
  onBookPress,
}: PackageDetailBookBarProps) {
  const insets = useSafeAreaInsets();
  const fadeStyle = useFadeInAnimation(visible ? 200 : 0, 350);
  const { animatedStyle: pressStyle, onPressIn, onPressOut } =
    buttonPressAnimation();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + spacing.sm },
        fadeStyle,
      ]}
    >
      <View style={styles.glassPanel}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>{priceLabel}</Text>
          <View
            style={[
              styles.statusPill,
              bookable ? styles.statusAvailable : styles.statusSoldOut,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                bookable ? styles.statusTextAvailable : styles.statusTextSoldOut,
              ]}
            >
              {availabilityLabel}
            </Text>
          </View>
        </View>
        <Animated.View style={[styles.buttonWrap, bookable && pressStyle]}>
          <Pressable
            onPress={bookable ? onBookPress : undefined}
            onPressIn={bookable ? onPressIn : undefined}
            onPressOut={bookable ? onPressOut : undefined}
            disabled={!bookable}
            style={!bookable && styles.buttonDisabledWrap}
          >
            <LinearGradient
              colors={
                bookable
                  ? gradients.tealAccent.colors
                  : [colors.border.dark, colors.text.muted]
              }
              start={gradients.tealAccent.start}
              end={gradients.tealAccent.end}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {bookable ? 'Book Now' : 'Sold Out'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface.navbarSolid,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.lg,
  },
  glassPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: PACKAGE_DETAIL_BOOK_BAR_HEIGHT - spacing.lg,
    gap: spacing.md,
  },
  priceBlock: {
    flex: 1,
  },
  priceLabel: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
  },
  priceValue: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusAvailable: {
    backgroundColor: colors.success.light,
  },
  statusSoldOut: {
    backgroundColor: colors.error.light,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: colors.success.dark,
  },
  statusTextSoldOut: {
    color: colors.error.dark,
  },
  buttonWrap: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  buttonDisabledWrap: {
    opacity: 0.85,
  },
  button: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
  },
  buttonText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
});
