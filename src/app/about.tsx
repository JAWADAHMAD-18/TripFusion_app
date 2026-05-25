import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  shadows,
  spacing,
} from "@/constants/theme";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={gradients.brandDeep.colors as [string, string, ...string[]]}
        start={gradients.brandDeep.start}
        end={gradients.brandDeep.end}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={spacing.md}
        >
          <Ionicons name="chevron-back" color="#ffffff" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>About Us</Text>
        <Text style={styles.headerSubtitle}>TripFusion</Text>
      </LinearGradient>

      {/* SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1 — Hero card */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={gradients.brandDeep.colors as [string, string, ...string[]]}
            start={gradients.brandDeep.start}
            end={gradients.brandDeep.end}
            style={styles.heroCardGradient}
          >
            <Text style={styles.heroEmoji}>✈️</Text>
            <Text style={styles.heroTitle}>TripFusion</Text>
            <Text style={styles.heroMissionText}>
              TripFusion was built with one simple belief — that travel should
              be accessible, seamless, and unforgettable for everyone. We
              connect travelers with handpicked packages, real-time AI
              assistance, and a booking experience designed around you.
            </Text>
          </LinearGradient>
        </View>

        {/* Section 2 — Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Packages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.accent.teal }]}>
              50+
            </Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.accent.blue }]}>
              10K+
            </Text>
            <Text style={styles.statLabel}>Travelers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.warning.main }]}>
              4.8★
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Section 3 — Why TripFusion card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why TripFusion?</Text>

          <View style={styles.featuresContainer}>
            {/* Row 1 */}
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(13,148,136,0.1)" },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  color={colors.accent.teal}
                  size={20}
                />
              </View>
              <View style={styles.featureTextColumn}>
                <Text style={styles.featureName}>Verified Packages</Text>
                <Text style={styles.featureDesc}>
                  Every package is carefully vetted for quality
                </Text>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(74,144,226,0.1)" },
                ]}
              >
                <Ionicons
                  name="sparkles"
                  color={colors.accent.blue}
                  size={20}
                />
              </View>
              <View style={styles.featureTextColumn}>
                <Text style={styles.featureName}>AI-Powered Assistant</Text>
                <Text style={styles.featureDesc}>
                  Get instant travel advice anytime, anywhere
                </Text>
              </View>
            </View>

            {/* Row 3 */}
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(13,148,136,0.1)" },
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  color={colors.accent.teal}
                  size={20}
                />
              </View>
              <View style={styles.featureTextColumn}>
                <Text style={styles.featureName}>Secure Booking</Text>
                <Text style={styles.featureDesc}>
                  Your payments and data are always protected
                </Text>
              </View>
            </View>

            {/* Row 4 */}
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(74,144,226,0.1)" },
                ]}
              >
                <Ionicons name="headset" color={colors.accent.blue} size={20} />
              </View>
              <View style={styles.featureTextColumn}>
                <Text style={styles.featureName}>24/7 Support</Text>
                <Text style={styles.featureDesc}>
                  We are here whenever you need us
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 4 — Founder card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Meet the Founder</Text>

          <View style={styles.founderRow}>
            <Image
              source={require("../../assets/images/jawadAhmad.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.founderTextColumn}>
              <Text style={styles.founderName}>Jawad Ahmad</Text>
              <Text style={styles.founderTitle}>Founder & Developer</Text>
              <Text style={styles.founderBio}>
                Full-stack developer passionate about travel and technology.
                Built TripFusion to make travel booking smarter and more
                accessible for everyone.
              </Text>
            </View>
          </View>

          <View style={styles.socialRow}>
            <Pressable
              onPress={() => console.log("LinkedIn")}
              style={styles.socialPill}
              hitSlop={spacing.sm}
            >
              <Ionicons
                name="logo-linkedin"
                color={colors.accent.blue}
                size={14}
              />
              <Text style={styles.socialPillText}>LinkedIn</Text>
            </Pressable>
          </View>
        </View>

        {/* Section 5 — App version footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 TripFusion. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: spacing.lg,
    bottom: spacing.md,
  },
  headerTitle: {
    color: colors.text.light,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSubtitle: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCardContainer: {
    margin: spacing.lg,
    borderRadius: borderRadius.xxl,
    overflow: "hidden",
  },
  heroCardGradient: {
    padding: spacing.xxl,
  },
  heroEmoji: {
    fontSize: 48,
    textAlign: "center",
  },
  heroTitle: {
    color: colors.accent.teal,
    fontSize: fontSizes.xl,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.md,
  },
  heroMissionText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    textAlign: "center",
    lineHeight: 24,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statCard: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  statNumber: {
    color: colors.primary,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    margin: spacing.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  featuresContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  featureTextColumn: {
    flex: 1,
  },
  featureName: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  featureDesc: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  founderRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
  },
  founderTextColumn: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  founderName: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  founderTitle: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  founderBio: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  socialRow: {
    marginTop: spacing.md,
    flexDirection: "row",
  },
  socialPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  socialPillText: {
    color: colors.text.secondary,
    fontSize: fontSizes.xs,
    marginLeft: spacing.xs,
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  footerText: {
    color: colors.text.muted,
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
});
