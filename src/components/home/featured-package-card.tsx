import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  FEATURED_CARD_HEIGHT,
  FEATURED_CARD_OVERLAY_HEIGHT,
  FEATURED_CARD_WIDTH,
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
import { useStaggerAnimation } from '@/utils/animations';

export type FeaturedPackage = {
  _id: string;
  name: string;
  destination?: string;
  price?: number;
  duration?: number;
  durationDays?: number;
  images?: string[];
};

type FeaturedPackageCardProps = {
  packageItem: FeaturedPackage;
  index: number;
};

function formatPrice(price?: number): string {
  if (price == null) return 'PKR —';
  return `PKR ${price.toLocaleString('en-PK')}`;
}

function formatDuration(pkg: FeaturedPackage): string {
  const days = pkg.durationDays ?? pkg.duration;
  if (days == null) return '';
  return `${days} days`;
}

export function FeaturedPackageCard({
  packageItem,
  index,
}: FeaturedPackageCardProps) {
  const router = useRouter();
  const animatedStyle = useStaggerAnimation(index);
  const imageUri = packageItem.images?.[0] ?? PACKAGE_PLACEHOLDER_IMAGE_URI;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/package/${packageItem._id}`)}
        style={styles.card}
      >
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={gradients.packageCard.colors}
          start={gradients.packageCard.start}
          end={gradients.packageCard.end}
          style={styles.overlay}
        />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {packageItem.name}
          </Text>
          <View style={styles.destinationRow}>
            <Text style={styles.destinationIcon}>📍</Text>
            <Text style={styles.destination} numberOfLines={1}>
              {packageItem.destination ?? 'Pakistan'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.price}>{formatPrice(packageItem.price)}</Text>
            <Text style={styles.duration}>{formatDuration(packageItem)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: FEATURED_CARD_WIDTH,
    height: FEATURED_CARD_HEIGHT,
    marginRight: spacing.md,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.cardGlowTeal,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FEATURED_CARD_OVERLAY_HEIGHT,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  name: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  destinationIcon: {
    fontSize: fontSizes.xs,
  },
  destination: {
    flex: 1,
    color: colors.text.onDark.soft,
    fontSize: fontSizes.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  price: {
    color: colors.accent.teal,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  duration: {
    color: colors.text.onDark.subtitle,
    fontSize: fontSizes.xs,
  },
});
