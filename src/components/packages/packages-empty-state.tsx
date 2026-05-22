import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';

type PackagesEmptyStateProps = {
  isSearching?: boolean;
};

export function PackagesEmptyState({ isSearching }: PackagesEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="compass-outline" size={fontSizes.xxxl} color={colors.accent.teal} />
      </View>
      <Text style={styles.title}>
        {isSearching ? 'No packages found' : 'No packages yet'}
      </Text>
      <Text style={styles.subtitle}>
        {isSearching
          ? 'Try a different destination or keyword.'
          : 'Check back soon for new adventures.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  iconWrap: {
    width: spacing.huge + spacing.xxl,
    height: spacing.huge + spacing.xxl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
