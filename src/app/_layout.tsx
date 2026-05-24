import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
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

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = '/' + segments.join('/');
    const publicRoutes = ['/(auth)/login', '/(auth)/register'];
    const isPublicRoute = publicRoutes.includes(currentRoute);
    const isAuthRoute = segments[0] === '(auth)';

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && isAuthRoute) {
      router.replace('/(tabs)/');
    }
  }, [isLoading, isAuthenticated, segments, router]);

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

