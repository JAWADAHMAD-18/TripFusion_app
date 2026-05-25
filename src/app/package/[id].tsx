import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PackageAvailabilitySection } from '@/components/package-detail/package-availability-section';
import { PackageDetailBookBar } from '@/components/package-detail/package-detail-book-bar';
import { PackageDetailError } from '@/components/package-detail/package-detail-error';
import { PackageDetailOverview } from '@/components/package-detail/package-detail-overview';
import { PackageDetailSkeleton } from '@/components/package-detail/package-detail-skeleton';
import { PackageDetailsGrid } from '@/components/package-detail/package-details-grid';
import { PackageHighlightsSection } from '@/components/package-detail/package-highlights-section';
import { PackageImageGallery } from '@/components/package-detail/package-image-gallery';
import { PackageLuxuryHero } from '@/components/package-detail/package-luxury-hero';
import { PackageScheduleSection } from '@/components/package-detail/package-schedule-section';
import { PACKAGE_DETAIL_BOOK_BAR_HEIGHT } from '@/constants/home';
import { colors, spacing } from '@/constants/theme';
import { usePackageDetails } from '@/hooks/use-package-details';
import { useAuthStore } from '@/store/authStore';
import { useFadeUpAnimation } from '@/utils/animations';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function resolvePackageId(id: string | string[] | undefined): string | undefined {
  if (typeof id === 'string') return id;
  if (Array.isArray(id) && id.length > 0) return id[0];
  return undefined;
}

function formatPriceLabel(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`;
}

function getAvailabilityLabel(bookable: boolean, availableSlot: number): string {
  if (!bookable) return 'Sold Out';
  if (availableSlot <= 3) return `Only ${availableSlot} left`;
  return 'Available now';
}

export default function PackageDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const packageId = resolvePackageId(id);
  const scrollY = useSharedValue(0);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);

  const { packageDetail, isLoading, error, refetch } =
    usePackageDetails(packageId);

  const overviewStyle = useFadeUpAnimation(100);
  const highlightsStyle = useFadeUpAnimation(180);
  const detailsStyle = useFadeUpAnimation(260);
  const availabilityStyle = useFadeUpAnimation(340);
  const scheduleStyle = useFadeUpAnimation(420);
  const galleryStyle = useFadeUpAnimation(500);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (isLoading) {
    return <PackageDetailSkeleton />;
  }

  if (error || !packageDetail) {
    return (
      <PackageDetailError
        message={error ?? 'Package not found.'}
        onRetry={refetch}
        onBack={() => router.back()}
      />
    );
  }

  const scrollBottomPadding =
    PACKAGE_DETAIL_BOOK_BAR_HEIGHT + insets.bottom + spacing.xxl;

  const shouldPromptAuth = isGuest || !isAuthenticated;

  const onBookNow = () => {
    if (!packageDetail.bookable) return;
    if (shouldPromptAuth) {
      Alert.alert(
        'Login Required',
        'Create a free account to book this package and start your adventure!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
          { text: 'Register', onPress: () => router.push('/(auth)/register') },
        ]
      );
      return;
    }
    router.push(`/booking/create/${packageDetail.id}`);
  };

  return (
    <View style={styles.screen}>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}
      >
        <PackageLuxuryHero
          packageDetail={packageDetail}
          scrollY={scrollY}
          topInset={insets.top}
          onBack={() => router.back()}
        />

        <View style={styles.sections}>
          <PackageDetailOverview
            description={packageDetail.description}
            animatedStyle={overviewStyle}
          />
          <PackageHighlightsSection
            highlights={packageDetail.highlights}
            animatedStyle={highlightsStyle}
          />
          <PackageDetailsGrid
            packageDetail={packageDetail}
            animatedStyle={detailsStyle}
          />
          <PackageAvailabilitySection
            packageDetail={packageDetail}
            animatedStyle={availabilityStyle}
          />
          <PackageScheduleSection
            startDate={packageDetail.startDate}
            endDate={packageDetail.endDate}
            animatedStyle={scheduleStyle}
          />
          <PackageImageGallery
            images={packageDetail.images}
            animatedStyle={galleryStyle}
          />
        </View>
      </AnimatedScrollView>

      <PackageDetailBookBar
        visible
        bookable={packageDetail.bookable}
        priceLabel={formatPriceLabel(packageDetail.price)}
        availabilityLabel={getAvailabilityLabel(
          packageDetail.bookable,
          packageDetail.availableSlot,
        )}
        onBookPress={onBookNow}
        buttonText={shouldPromptAuth ? 'Login to Book' : undefined}
        useSecondaryColor={shouldPromptAuth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sections: {
    marginTop: spacing.md,
  },
});
