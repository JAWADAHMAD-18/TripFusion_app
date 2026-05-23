import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BookingCard } from '@/components/bookings/BookingCard';
import { BookingCardSkeletonList } from '@/components/bookings/BookingCardSkeleton';
import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';
import { useBookings } from '@/hooks/useBookings';

type TabKey = 'all' | 'upcoming';

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const {
    allBookings,
    upcomingBookings,
    isLoadingAll,
    isLoadingUpcoming,
    cancelBooking,
    refresh,
  } = useBookings();

  const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingUpcoming;
  const bookings = activeTab === 'all' ? allBookings : upcomingBookings;
  const isRefreshing = isLoadingAll || isLoadingUpcoming;

  const onRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const handleCancel = useCallback(
    async (id: string, reason: string) => {
      await cancelBooking(id, reason);
    },
    [cancelBooking],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Your travel history</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'all' }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.tabTextActive,
            ]}
          >
            All Bookings
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'upcoming' }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Upcoming
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <BookingCardSkeletonList />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySubtitle}>
            Start exploring our packages!
          </Text>
          <Pressable
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/packages')}
            accessibilityRole="button"
            accessibilityLabel="Browse packages"
          >
            <Text style={styles.browseButtonText}>Browse Packages</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.teal}
            />
          }
        >
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.xxxl,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text.light,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: 100,
  },
  emptyEmoji: {
    fontSize: fontSizes.display,
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.md,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: colors.accent.teal,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  browseButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
