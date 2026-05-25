import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { hasSeenOnboarding } from '@/utils/storage';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  const [hasSeenOnboardState, setHasSeenOnboardState] = useState<boolean | null>(null);

  useEffect(() => {
    async function init() {
      await loadFromStorage();
      const seen = await hasSeenOnboarding();
      setHasSeenOnboardState(seen);
    }
    init();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isLoading || hasSeenOnboardState === null) return;

    const currentRoute = '/' + segments.join('/');
    const publicRoutes = ['/(auth)/login', '/(auth)/register'];
    const isPublicRoute = publicRoutes.includes(currentRoute);
    const isAuthRoute = segments[0] === '(auth)';
    const isOnboardingRoute = segments[0] === 'onboarding';

    if (hasSeenOnboardState === false) {
      if (!isOnboardingRoute) {
        router.replace('/onboarding');
      }
      return;
    }

    // Onboarding complete (hasSeenOnboardState === true)
    if (isOnboardingRoute) {
      if (isAuthenticated || isGuest) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/(auth)/login');
      }
      return;
    }

    const isAllowed = isAuthenticated || isGuest;
    if (!isAllowed && !isPublicRoute) {
      router.replace('/(auth)/login');
    } else if (isAllowed && isAuthRoute) {
      router.replace('/(tabs)/');
    }
  }, [isLoading, hasSeenOnboardState, isAuthenticated, isGuest, segments, router]);

  if (isLoading || hasSeenOnboardState === null) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent.teal} />
          <Text style={styles.title}>TripFusion</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <Slot />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.xl,
  },
});

