import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { colors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.content,
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background.default,
  },
});
