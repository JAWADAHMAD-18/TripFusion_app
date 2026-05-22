import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';

type PackageDetailErrorProps = {
  message: string;
  onRetry: () => void;
  onBack: () => void;
};

export function PackageDetailError({
  message,
  onRetry,
  onBack,
}: PackageDetailErrorProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Could not load package</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.primaryButton} onPress={onRetry}>
        <Text style={styles.primaryButtonText}>Try again</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emoji: {
    fontSize: fontSizes.xxxl,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  primaryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent.teal,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  primaryButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
