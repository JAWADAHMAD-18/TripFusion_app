import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  borderRadius,
  colors,
  fontSizes,
  shadows,
  spacing,
} from '@/constants/theme';

type PackagesSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function PackagesSearchBar({
  value,
  onChangeText,
  placeholder = 'Search destinations, trips...',
}: PackagesSearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={fontSizes.lg}
        color={colors.text.muted}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSizes.md,
    paddingVertical: spacing.xs,
  },
});
