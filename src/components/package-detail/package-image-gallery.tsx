import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';

import {
  PACKAGE_GALLERY_IMAGE_HEIGHT,
  PACKAGE_GALLERY_IMAGE_WIDTH,
  PACKAGE_PLACEHOLDER_IMAGE_URI,
} from '@/constants/home';
import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';
import { PackageSectionCard } from '@/components/package-detail/package-section-card';

type PackageImageGalleryProps = {
  images: string[];
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

export function PackageImageGallery({
  images,
  animatedStyle,
}: PackageImageGalleryProps) {
  const galleryImages =
    images.length > 1 ? images : images.length === 1 ? [images[0]] : [];

  if (galleryImages.length <= 1) return null;

  return (
    <PackageSectionCard title="Photo Gallery" animatedStyle={animatedStyle}>
      <Text style={styles.caption}>Swipe to explore every angle</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {galleryImages.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.imageWrap}>
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    </PackageSectionCard>
  );
}

const styles = StyleSheet.create({
  caption: {
    color: colors.text.muted,
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  scrollContent: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  imageWrap: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.border.light,
  },
  image: {
    width: PACKAGE_GALLERY_IMAGE_WIDTH,
    height: PACKAGE_GALLERY_IMAGE_HEIGHT,
  },
});
