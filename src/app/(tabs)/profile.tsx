import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  shadows,
  spacing,
} from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

/* ──────────────────────── animated bar ──────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  experiences: colors.accent.teal,
  accommodations: colors.accent.blue,
  flights: colors.warning.main,
  custom: colors.secondary,
};

function CategoryBar({
  name,
  percentage,
  index,
}: {
  name: string;
  percentage: number;
  index: number;
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(percentage, {
      duration: 800,
    });
  }, [percentage, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: CATEGORY_COLORS[name] ?? colors.secondary,
  }));

  return (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryName}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View style={barStyle} />
      </View>
      <Text style={styles.categoryPct}>{Math.round(percentage)}%</Text>
    </View>
  );
}

/* ──────────────────────── screen ──────────────────────── */

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    isLoading,
    isSaving,
    error,
    successMessage,
    travelSummary,
    updateProfile,
    pickProfileImage,
  } = useProfile();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Re-init local state when user changes in store
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const hasChanges =
    name !== (user?.name ?? '') || phone !== (user?.phone ?? '');

  const handleSave = async () => {
    const payload: Record<string, string> = {};
    if (name !== (user?.name ?? '')) payload.name = name;
    if (phone !== (user?.phone ?? '')) payload.phone = phone;
    await updateProfile(payload);
  };

  const handlePickImage = async () => {
    const result = await pickProfileImage();
    if (result) {
      await updateProfile({ profilePic: result });
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  /* ─── render ─── */

  return (
    <View style={styles.screen}>
      {/* ── HEADER ── */}
      <LinearGradient
        colors={gradients.brandDeep.colors as [string, string, ...string[]]}
        start={gradients.brandDeep.start}
        end={gradients.brandDeep.end}
        style={styles.header}
      >
        <View style={styles.avatarWrap}>
          {isSaving ? (
            <View style={styles.avatarCircle}>
              <ActivityIndicator color={colors.text.light} size="large" />
            </View>
          ) : user?.profilePic ? (
            <Image
              source={{ uri: user.profilePic }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarInitials}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}

          {/* camera overlay */}
          <Pressable style={styles.cameraBtn} onPress={handlePickImage}>
            <Ionicons name="camera" color="#ffffff" size={14} />
          </Pressable>
        </View>

        {/* Google badge */}
        {user?.authProvider === 'google' && (
          <View style={styles.googleBadge}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleLabel}>Google Account</Text>
          </View>
        )}

        <Text style={styles.headerName}>{user?.name ?? ''}</Text>
        <Text style={styles.headerEmail}>{user?.email ?? ''}</Text>
      </LinearGradient>

      {/* ── SCROLL ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── SECTION 1: Edit Profile ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Edit Profile</Text>

          {/* Name */}
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={[
              styles.input,
              nameFocused && styles.inputFocused,
            ]}
            value={name}
            onChangeText={setName}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />

          {/* Phone */}
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            style={[
              styles.input,
              phoneFocused && styles.inputFocused,
            ]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+92 300 1234567"
            placeholderTextColor={colors.text.muted}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
          />

          {/* Email (read-only) */}
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.emailRow}>
            <TextInput
              style={[styles.input, styles.inputDisabled, { flex: 1 }]}
              value={user?.email ?? ''}
              editable={false}
            />
            <View style={styles.lockIcon}>
              <Ionicons
                name="lock-closed"
                color={colors.text.muted}
                size={14}
              />
            </View>
          </View>
          <Text style={styles.emailNote}>Email cannot be changed</Text>

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={!hasChanges || isSaving}
            style={{ marginTop: spacing.lg }}
          >
            <LinearGradient
              colors={
                hasChanges && !isSaving
                  ? (gradients.tealAccent.colors as [string, string])
                  : ['#9ca3af', '#9ca3af']
              }
              start={gradients.tealAccent.start}
              end={gradients.tealAccent.end}
              style={styles.saveBtn}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.text.light} />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </LinearGradient>
          </Pressable>

          {successMessage ? (
            <Text style={styles.successMsg}>{successMessage}</Text>
          ) : null}

          {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
        </View>

        {/* ── SECTION 2: Travel Summary ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Travel Summary</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Spent</Text>
              <Text style={styles.statValuePrimary}>
                PKR {(travelSummary?.totalSpent ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.statEmoji}>💰</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Savings</Text>
              <Text style={styles.statValueSuccess}>
                PKR {(travelSummary?.fusionSavings ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.statEmoji}>🎉</Text>
            </View>
          </View>

          {/* Category breakdown */}
          {travelSummary?.categoryBreakdown &&
            travelSummary.categoryBreakdown.length > 0 && (
              <>
                <Text style={styles.breakdownTitle}>
                  Spending by Category
                </Text>
                {travelSummary.categoryBreakdown.map((cat, idx) => (
                  <CategoryBar
                    key={cat.name}
                    name={cat.name}
                    percentage={cat.percentage}
                    index={idx}
                  />
                ))}
              </>
            )}
        </View>

        {/* ── SECTION 3: Quick Links ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Access</Text>

          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/(tabs)/bookings')}
          >
            <View style={[styles.linkIcon, styles.linkIconGreen]}>
              <Ionicons
                name="calendar"
                color={colors.success.main}
                size={18}
              />
            </View>
            <Text style={styles.linkLabel}>My Bookings</Text>
            <Ionicons
              name="chevron-forward"
              color={colors.text.muted}
              size={18}
            />
          </Pressable>

          <Pressable
            style={[styles.linkRow, styles.linkRowLast]}
            onPress={() => router.push('/(tabs)/packages')}
          >
            <View style={[styles.linkIcon, styles.linkIconBlue]}>
              <Ionicons
                name="grid"
                color={colors.accent.blue}
                size={18}
              />
            </View>
            <Text style={styles.linkLabel}>Browse Packages</Text>
            <Ionicons
              name="chevron-forward"
              color={colors.text.muted}
              size={18}
            />
          </Pressable>
        </View>

        {/* ── SECTION 4: Account ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>

          {/* Member since */}
          <View style={styles.accountRow}>
            <Ionicons
              name="time-outline"
              color={colors.text.muted}
              size={16}
            />
            <Text style={styles.accountText}>
              Member since {formattedDate}
            </Text>
          </View>

          {/* Auth provider */}
          <View style={styles.accountRow}>
            {user?.authProvider === 'google' ? (
              <>
                <Text style={styles.googleGSmall}>G</Text>
                <Text style={styles.accountText}>
                  Signed in with Google
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="mail"
                  color={colors.text.muted}
                  size={16}
                />
                <Text style={styles.accountText}>Email &amp; Password</Text>
              </>
            )}
          </View>

          {/* Logout */}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              color={colors.error.main}
              size={18}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ──────────────────────── styles ──────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  /* header */
  header: {
    paddingTop: 52,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.accent.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarInitials: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.accent.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: colors.text.light,
    fontSize: fontSizes.xxxl,
    fontWeight: '700',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.teal,
    borderWidth: 2,
    borderColor: colors.text.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  googleG: {
    color: colors.accent.blue,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  googleLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSizes.xs,
  },
  headerName: {
    color: colors.text.light,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  headerEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSizes.sm,
  },

  /* scroll */
  scrollContent: {
    paddingBottom: 100,
  },

  /* card */
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },

  /* form */
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    color: colors.primary,
    fontSize: fontSizes.md,
  },
  inputFocused: {
    borderColor: colors.accent.teal,
  },
  inputDisabled: {
    backgroundColor: colors.border.light,
    color: colors.text.muted,
  },
  emailRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    position: 'absolute',
    right: spacing.lg,
  },
  emailNote: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  saveBtn: {
    borderRadius: borderRadius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  successMsg: {
    color: colors.success.main,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  errorMsg: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  /* travel summary */
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: fontSizes.xs,
    marginBottom: spacing.xs,
  },
  statValuePrimary: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: '700',
  },
  statValueSuccess: {
    color: colors.success.main,
    fontSize: fontSizes.xl,
    fontWeight: '700',
  },
  statEmoji: {
    fontSize: fontSizes.xl,
    marginTop: spacing.xs,
  },
  breakdownTitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryName: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    width: 100,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  categoryPct: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
    width: 35,
    textAlign: 'right',
  },

  /* quick links */
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
  },
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  linkIconGreen: {
    backgroundColor: colors.success.light,
  },
  linkIconBlue: {
    backgroundColor: 'rgba(74,144,226,0.1)',
  },
  linkLabel: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: '500',
    flex: 1,
  },

  /* account */
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  accountText: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
  },
  googleGSmall: {
    color: colors.accent.blue,
    fontWeight: '700',
    fontSize: fontSizes.sm,
  },
  logoutBtn: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error.main,
    borderRadius: borderRadius.lg,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.error.main,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
