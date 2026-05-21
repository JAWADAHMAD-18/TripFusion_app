import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import {
  FeaturedPackageCard
} from "@/components/home/featured-package-card";
import {
  AVATAR_SIZE,
  FEATURED_CARD_HEIGHT,
  FEATURED_CARD_WIDTH,
  HOME_HEADER_PADDING_TOP,
  HOME_TAB_BAR_PADDING_BOTTOM,
} from "@/constants/home";
import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  shadows,
  spacing,
} from "@/constants/theme";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useFadeUpAnimation } from "@/utils/animations";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const SKELETON_COUNT = 3;

type AuthUser = {
  name?: string;
  email?: string;
};

type Booking = {
  _id: string;
  status?: string;
  package?: { name?: string };
  packageName?: string;
  startDate?: string;
  travelDate?: string;
  createdAt?: string;
};

function getUserName(user: object | null): string {
  const authUser = user as AuthUser | null;
  return authUser?.name?.trim() || "Traveller";
}

function getUserInitial(user: object | null): string {
  const name = getUserName(user);
  return name.charAt(0).toUpperCase() || "T";
}

function extractPackagesTotal(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as Record<string, unknown>;
  if (typeof payload.total === "number") return payload.total;
  if (typeof payload.count === "number") return payload.count;
  if (Array.isArray(payload.packages)) return payload.packages.length;
  if (Array.isArray(payload.data)) return payload.data.length;
  const nested = payload.data as Record<string, unknown> | undefined;
  if (nested && typeof nested.total === "number") return nested.total;
  if (nested && Array.isArray(nested.packages)) return nested.packages.length;
  return null;
}

function extractPackagesList(data: unknown): FeaturedPackage[] {
  if (!data || typeof data !== "object") return [];
  const payload = data as Record<string, unknown>;
  if (Array.isArray(payload.packages))
    return payload.packages as FeaturedPackage[];
  if (Array.isArray(payload.data)) return payload.data as FeaturedPackage[];
  const nested = payload.data as Record<string, unknown> | undefined;
  if (nested && Array.isArray(nested.packages)) {
    return nested.packages as FeaturedPackage[];
  }
  return [];
}

function extractBookingsList(data: unknown): Booking[] {
  if (!data || typeof data !== "object") return [];
  const payload = data as Record<string, unknown>;
  if (Array.isArray(payload.bookings)) return payload.bookings as Booking[];
  if (Array.isArray(payload.data)) return payload.data as Booking[];
  const nested = payload.data as Record<string, unknown> | undefined;
  if (nested && Array.isArray(nested.bookings)) {
    return nested.bookings as Booking[];
  }
  return [];
}

function formatBookingDate(booking: Booking): string {
  const raw = booking.startDate ?? booking.travelDate ?? booking.createdAt;
  if (!raw) return "Date TBD";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getBookingPackageName(booking: Booking): string {
  return booking.package?.name ?? booking.packageName ?? "Travel package";
}

function getStatusTheme(status?: string) {
  const normalized = (status ?? "pending").toLowerCase();
  if (normalized === "confirmed") {
    return {
      bar: colors.success.main,
      badgeBg: colors.success.light,
      badgeText: colors.success.dark,
      label: "Confirmed",
    };
  }
  if (normalized === "cancelled" || normalized === "canceled") {
    return {
      bar: colors.error.main,
      badgeBg: colors.error.light,
      badgeText: colors.error.dark,
      label: "Cancelled",
    };
  }
  return {
    bar: colors.warning.main,
    badgeBg: colors.warning.light,
    badgeText: colors.warning.dark,
    label: "Pending",
  };
}

function usePulseOpacity() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
  }, [opacity]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
}

function PackageSkeletonCard() {
  const pulseStyle = usePulseOpacity();
  return <Animated.View style={[styles.skeletonCard, pulseStyle]} />;
}

function StatCard({
  emoji,
  label,
  value,
  valueColor,
}: {
  emoji: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[styles.statValue, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
    </View>
  );
}

function BookingSkeleton() {
  const pulseStyle = usePulseOpacity();
  return (
    <View style={styles.bookingSkeleton}>
      <Animated.View style={[styles.bookingSkeletonBar, pulseStyle]} />
      <View style={styles.bookingSkeletonContent}>
        <Animated.View style={[styles.bookingSkeletonLine, pulseStyle]} />
        <Animated.View style={[styles.bookingSkeletonLineShort, pulseStyle]} />
      </View>
    </View>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const statusTheme = getStatusTheme(booking.status);
  return (
    <View style={styles.bookingCard}>
      <View
        style={[styles.bookingStatusBar, { backgroundColor: statusTheme.bar }]}
      />
      <View style={styles.bookingContent}>
        <Text style={styles.bookingName}>{getBookingPackageName(booking)}</Text>
        <Text style={styles.bookingDate}>{formatBookingDate(booking)}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusTheme.badgeBg }]}
        >
          <Text
            style={[styles.statusBadgeText, { color: statusTheme.badgeText }]}
          >
            {statusTheme.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const screenAnimatedStyle = useFadeUpAnimation();

  const [searchQuery, setSearchQuery] = useState("");
  const [featuredPackages, setFeaturedPackages] = useState<FeaturedPackage[]>(
    [],
  );
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [packagesCount, setPackagesCount] = useState<string>("...");
  const [bookingsCount, setBookingsCount] = useState<string>("...");
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchPackagesData = async () => {
      setIsLoadingPackages(true);
      try {
        const [featuredRes, countRes] = await Promise.all([
          api.get("/packages", { params: { limit: 5, featured: true } }),
          api.get("/packages", { params: { limit: 1 } }),
        ]);
        if (!cancelled) {
          setFeaturedPackages(extractPackagesList(featuredRes.data));
          const total = extractPackagesTotal(countRes.data);
          setPackagesCount(total != null ? String(total) : "0");
        }
      } catch {
        if (!cancelled) {
          setFeaturedPackages([]);
          setPackagesCount("0");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPackages(false);
        }
      }
    };

    fetchPackagesData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchRecentBookings = async () => {
      setIsLoadingBookings(true);
      try {
        const { data } = await api.get("/bookings/my");
        if (!cancelled) {
          const bookings = extractBookingsList(data);
          setRecentBookings(bookings.slice(0, 2));
          setBookingsCount(String(bookings.length));
        }
      } catch {
        if (!cancelled) {
          setRecentBookings([]);
          setBookingsCount("0");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBookings(false);
        }
      }
    };

    fetchRecentBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSearch = useCallback(() => {
    const query = searchQuery.trim();
    router.push({
      pathname: "/(tabs)/packages",
      params: query ? { search: query } : {},
    });
  }, [router, searchQuery]);

  const displayBookings = recentBookings.slice(0, 2);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.screenInner, screenAnimatedStyle]}>
        <AnimatedScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Good morning 👋</Text>
              <Text style={styles.userName}>{getUserName(user)}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitial(user)}</Text>
            </View>
          </View>

          <LinearGradient
            colors={gradients.brandDeep.colors}
            start={gradients.brandDeep.start}
            end={gradients.brandDeep.end}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>Where to next?</Text>
            <Text style={styles.heroSubtitle}>
              Find your perfect travel package
            </Text>
            <View style={styles.searchRow}>
              <Ionicons
                name="search"
                size={fontSizes.lg}
                color={colors.text.onDark.faint}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search destinations..."
                placeholderTextColor={colors.text.onDark.placeholder}
                returnKeyType="search"
                onSubmitEditing={onSearch}
              />
            </View>
            <Pressable onPress={onSearch}>
              <LinearGradient
                colors={gradients.tealAccent.colors}
                start={gradients.tealAccent.start}
                end={gradients.tealAccent.end}
                style={styles.searchButton}
              >
                <Text style={styles.searchButtonText}>Search Packages</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>

          <View style={styles.statsRow}>
            <StatCard emoji="✈️" label="Packages" value={packagesCount} />
            <StatCard
              emoji="📅"
              label="Bookings"
              value={isLoadingBookings ? "..." : bookingsCount}
            />
            <StatCard
              emoji="🌍"
              label="Destinations"
              value="20+"
              valueColor={colors.accent.teal}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Packages</Text>
              <Pressable onPress={() => router.push("/(tabs)/packages")}>
                <Text style={styles.sectionLink}>See all</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            >
              {isLoadingPackages
                ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <PackageSkeletonCard key={`skeleton-${index}`} />
                  ))
                : featuredPackages.map((pkg, index) => (
                    <FeaturedPackageCard
                      key={pkg._id}
                      packageItem={pkg}
                      index={index}
                    />
                  ))}
            </ScrollView>
          </View>

          <View style={styles.bookingsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Recent Bookings</Text>
              <Pressable onPress={() => router.push("/(tabs)/bookings")}>
                <Text style={styles.sectionLink}>See all</Text>
              </Pressable>
            </View>

            {isLoadingBookings ? (
              <BookingSkeleton />
            ) : displayBookings.length === 0 ? (
              <View style={styles.emptyBookings}>
                <Text style={styles.emptyEmoji}>🗺️</Text>
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start exploring packages!
                </Text>
              </View>
            ) : (
              displayBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))
            )}
          </View>
        </AnimatedScrollView>
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
  scrollContent: {
    paddingBottom: HOME_TAB_BAR_PADDING_BOTTOM,
  },
  header: {
    paddingTop: HOME_HEADER_PADDING_TOP,
    paddingHorizontal: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  greeting: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
  },
  userName: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text.light,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    ...shadows.cardGlowNavy,
  },
  heroTitle: {
    color: colors.text.light,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: colors.text.onDark.subtitle,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.hero.searchInput,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.hero.searchInputBorder,
    padding: spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text.light,
    fontSize: fontSizes.md,
  },
  searchButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  searchButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.sm,
  },
  statEmoji: {
    fontSize: fontSizes.xl,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  statValue: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxl,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  sectionLink: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
  },
  featuredList: {
    marginTop: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
  },
  skeletonCard: {
    width: FEATURED_CARD_WIDTH,
    height: FEATURED_CARD_HEIGHT,
    marginRight: spacing.md,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
  },
  bookingsSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  bookingCard: {
    flexDirection: "row",
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    overflow: "hidden",
  },
  bookingStatusBar: {
    width: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
    alignSelf: "stretch",
  },
  bookingContent: {
    flex: 1,
  },
  bookingName: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  bookingDate: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  emptyBookings: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: "center",
    marginTop: spacing.md,
  },
  emptyEmoji: {
    fontSize: fontSizes.xxxl,
  },
  emptyTitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.md,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  bookingSkeleton: {
    flexDirection: "row",
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  bookingSkeletonBar: {
    width: spacing.xs,
    height: spacing.huge,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border.light,
    marginRight: spacing.md,
  },
  bookingSkeletonContent: {
    flex: 1,
    gap: spacing.sm,
  },
  bookingSkeletonLine: {
    height: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border.light,
  },
  bookingSkeletonLineShort: {
    height: spacing.md,
    width: "60%",
    borderRadius: borderRadius.md,
    backgroundColor: colors.border.light,
  },
});
