import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, spacing } from '@/constants/theme';

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Package</Text>
      <Text style={styles.subtitle}>{id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: spacing.xl,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.md,
    marginTop: spacing.sm,
  },
});
