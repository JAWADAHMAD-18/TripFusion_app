import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { ExplorePackageCard } from '@/components/packages/explore-package-card';
import { PackageCardSkeleton } from '@/components/packages/package-card-skeleton';
import { PackagesEmptyState } from '@/components/packages/packages-empty-state';
import { PackagesErrorState } from '@/components/packages/packages-error-state';
import { PackagesSearchBar } from '@/components/packages/packages-search-bar';
import { HOME_HEADER_PADDING_TOP, HOME_TAB_BAR_PADDING_BOTTOM } from '@/constants/home';
import { colors, fontSizes, spacing } from '@/constants/theme';
import { usePackagesExplore } from '@/hooks/use-packages-explore';
import type { PackageListItem } from '@/types/package';
import { useFadeUpAnimation } from '@/utils/animations';

const SKELETON_COUNT = 6;
const NUM_COLUMNS = 2;

const skeletonData = Array.from({ length: SKELETON_COUNT }, (_, i) => ({
  id: `skeleton-${i}`,
}));

export default function PackagesScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();
  const initialSearch = typeof search === 'string' ? search : '';
  const screenStyle = useFadeUpAnimation();
  const {
    query,
    setQuery,
    packages,
    isLoading,
    error,
    refetch,
    isSearching,
  } = usePackagesExplore(initialSearch);

  useEffect(() => {
    if (initialSearch) {
      setQuery(initialSearch);
    }
  }, [initialSearch, setQuery]);

  const listHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.screenTitle}>Explore Packages</Text>
      <Text style={styles.screenSubtitle}>
        Curated trips designed for instant discovery
      </Text>
      <PackagesSearchBar value={query} onChangeText={setQuery} />
      {!isLoading && !error ? (
        <Text style={styles.resultCount}>
          {packages.length} {packages.length === 1 ? 'package' : 'packages'}
          {isSearching ? ' found' : ' available'}
        </Text>
      ) : null}
    </View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: PackageListItem | { id: string };
    index: number;
  }) => (
    <View style={styles.gridItem}>
      {isLoading ? (
        <PackageCardSkeleton />
      ) : (
        <ExplorePackageCard
          packageItem={item as PackageListItem}
          index={index}
        />
      )}
    </View>
  );

  const listEmpty = () => {
    if (isLoading) return null;
    if (error) {
      return <PackagesErrorState message={error} onRetry={refetch} />;
    }
    return <PackagesEmptyState isSearching={isSearching} />;
  };

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.screenInner, screenStyle]}>
        <FlatList
          data={isLoading ? skeletonData : packages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={isLoading || packages.length > 0 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  screenInner: {
    flex: 1,
  },
  listContent: {
    paddingBottom: HOME_TAB_BAR_PADDING_BOTTOM,
    flexGrow: 1,
  },
  headerBlock: {
    paddingTop: HOME_HEADER_PADDING_TOP,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  screenTitle: {
    color: colors.primary,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
  },
  screenSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  resultCount: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  columnWrapper: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
});
