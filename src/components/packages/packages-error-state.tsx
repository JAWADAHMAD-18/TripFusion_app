import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';

type PackagesErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function PackagesErrorState({ message, onRetry }: PackagesErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  emoji: {
    fontSize: fontSizes.xxxl,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  message: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
