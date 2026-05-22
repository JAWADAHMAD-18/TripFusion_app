import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  PACKAGE_DETAIL_HERO_HEIGHT,
  PACKAGE_PLACEHOLDER_IMAGE_URI,
} from '@/constants/home';
import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  shadows,
  spacing,
} from '@/constants/theme';
import type { PackageDetail } from '@/types/package';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedImage = Animated.createAnimatedComponent(Image);

type PackageLuxuryHeroProps = {
  packageDetail: PackageDetail;
  scrollY: SharedValue<number>;
  topInset: number;
  onBack: () => void;
};

function formatHeroPrice(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`;
}

export function PackageLuxuryHero({
  packageDetail,
  scrollY,
  topInset,
  onBack,
}: PackageLuxuryHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const zoomScale = useSharedValue(1);
  const slides =
    packageDetail.carouselImages.length > 0
      ? packageDetail.carouselImages
      : [PACKAGE_PLACEHOLDER_IMAGE_URI];

  useEffect(() => {
    zoomScale.value = withSpring(1.05, { damping: 14 }, () => {
      zoomScale.value = withSpring(1, { damping: 16 });
    });
  }, [activeIndex, zoomScale]);

  const onCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, PACKAGE_DETAIL_HERO_HEIGHT],
          [0, PACKAGE_DETAIL_HERO_HEIGHT * 0.4],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomScale.value }],
  }));

  const locationLabel = [packageDetail.city, packageDetail.location]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.carouselWrap, parallaxStyle]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onCarouselScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {slides.map((uri, index) => (
            <AnimatedImage
              key={`${uri}-${index}`}
              source={{ uri }}
              style={[
                styles.image,
                index === activeIndex ? zoomStyle : undefined,
              ]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </Animated.View>

      <LinearGradient
        colors={[
          'rgba(10,26,68,0.05)',
          'rgba(10,26,68,0.45)',
          'rgba(10,26,68,0.92)',
        ]}
        locations={[0, 0.55, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      <Pressable
        style={[styles.backButton, { top: topInset + spacing.sm }]}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons
          name="chevron-back"
          size={fontSizes.xl}
          color={colors.text.light}
        />
      </Pressable>

      <View style={styles.glassCardWrap} pointerEvents="box-none">
        <BlurView
          intensity={50}
          tint="dark"
          style={styles.glassBlur}
          experimentalBlurMethod="dimezisBlurView"
        >
          <View style={styles.glassContent}>
            {packageDetail.tripType ? (
              <View style={styles.tripBadge}>
                <Text style={styles.tripBadgeText}>
                  {packageDetail.tripType}
                </Text>
              </View>
            ) : null}
            <Text style={styles.heroTitle} numberOfLines={2}>
              {packageDetail.title}
            </Text>
            {locationLabel ? (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location"
                  size={fontSizes.sm}
                  color={colors.accent.teal}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationLabel}
                </Text>
              </View>
            ) : null}
            <Text style={styles.heroPrice}>{formatHeroPrice(packageDetail.price)}</Text>
          </View>
        </BlurView>
      </View>

      {slides.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {slides.map((uri, index) => (
            <View
              key={`dot-${uri}-${index}`}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PACKAGE_DETAIL_HERO_HEIGHT,
    backgroundColor: colors.primary,
  },
  carouselWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: PACKAGE_DETAIL_HERO_HEIGHT,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: spacing.xxxl + spacing.sm,
    height: spacing.xxxl + spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.navbar,
    borderWidth: 1,
    borderColor: colors.surface.tabBarBorder,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.sm,
  },
  glassCardWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  glassBlur: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  glassContent: {
    padding: spacing.lg,
    backgroundColor: colors.auth.card,
    gap: spacing.xs,
  },
  tripBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface.tabIconActiveGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  tripBadgeText: {
    color: colors.accent.teal,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  heroTitle: {
    color: colors.text.light,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    lineHeight: fontSizes.xxxl,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    flex: 1,
    color: colors.text.onDark.soft,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  heroPrice: {
    color: colors.accent.teal,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  dots: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.navbar,
  },
  dotActive: {
    width: spacing.lg,
    backgroundColor: colors.accent.teal,
  },
});
