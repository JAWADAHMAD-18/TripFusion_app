import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { PACKAGE_PLACEHOLDER_IMAGE_URI } from '@/constants/home';
import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';
import type { PackageListItem } from '@/types/package';
import { useStaggerAnimation } from '@/utils/animations';

type ExplorePackageCardProps = {
  packageItem: PackageListItem;
  index: number;
};

function formatPrice(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`;
}

export function ExplorePackageCard({
  packageItem,
  index,
}: ExplorePackageCardProps) {
  const router = useRouter();
  const animatedStyle = useStaggerAnimation(index);
  const imageUri = packageItem.thumbnail || PACKAGE_PLACEHOLDER_IMAGE_URI;
  const visibleTags = packageItem.tags.slice(0, 2);

  return (
    <Animated.View style={[styles.animatedWrap, animatedStyle]}>
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/package/${packageItem.id}`)}
      >
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {packageItem.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={fontSizes.sm}
              color={colors.text.secondary}
            />
            <Text style={styles.location} numberOfLines={1}>
              {packageItem.location}
            </Text>
          </View>
          <Text style={styles.summary} numberOfLines={2}>
            {packageItem.quickSummary}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.price}>{formatPrice(packageItem.price)}</Text>
            {packageItem.duration ? (
              <Text style={styles.duration}>{packageItem.duration}</Text>
            ) : null}
          </View>
          {visibleTags.length > 0 ? (
            <View style={styles.tagsRow}>
              {visibleTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedWrap: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border.light,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSizes.xs,
  },
  summary: {
    color: colors.text.secondary,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.sm + 2,
    minHeight: fontSizes.sm * 2 + 4,
  },
  metaRow: {
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
  duration: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.success.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    maxWidth: '100%',
  },
  tagText: {
    color: colors.success.dark,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
