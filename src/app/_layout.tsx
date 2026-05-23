import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const PUBLIC_AUTH_SEGMENTS = new Set(['login', 'register']);

function isPublicAuthRoute(segments: string[]): boolean {
  return segments[0] === '(auth)' && PUBLIC_AUTH_SEGMENTS.has(segments[1] ?? '');
}

function isAuthGroupRoute(segments: string[]): boolean {
  return segments[0] === '(auth)';
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent.teal} />
          <Text style={styles.title}>TripFusion</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  const segmentList = segments as string[];
  const onPublicRoute = isPublicAuthRoute(segmentList);
  const onAuthRoute = isAuthGroupRoute(segmentList);

  if (!isAuthenticated && !onPublicRoute) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <Redirect href="/(auth)/login" />
      </GestureHandlerRootView>
    );
  }

  if (isAuthenticated && onAuthRoute) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <Redirect href="/(tabs)/" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <Slot />
      {/* TEMP DEBUG - remove before production */}
      <View style={styles.debugContainer} pointerEvents="box-none">
        <Pressable
          style={[styles.debugButton, styles.debugButtonTabs]}
          onPress={() => router.replace('/(tabs)/')}
        >
          <Text style={styles.debugButtonText}>→ Tabs</Text>
        </Pressable>
        <Pressable
          style={[styles.debugButton, styles.debugButtonLogin]}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.debugButtonText}>→ Login</Text>
        </Pressable>
      </View>
      {/* TEMP DEBUG - remove before production */}
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
  debugContainer: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    zIndex: 9999,
  },
  debugButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  debugButtonTabs: {
    backgroundColor: colors.accent.teal,
    marginBottom: spacing.xs,
  },
  debugButtonLogin: {
    backgroundColor: colors.secondary,
  },
  debugButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.xs,
  },
});
