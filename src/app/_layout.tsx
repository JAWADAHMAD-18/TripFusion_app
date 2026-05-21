import { Slot, useRouter } from 'expo-router';
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

export default function RootLayout() {
  const router = useRouter();
  const isLoading = useAuthStore((state) => state.isLoading);
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
    gap: 16,
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
