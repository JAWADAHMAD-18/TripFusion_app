import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, fontSizes, spacing } from '@/constants/theme';
import { useFadeUpAnimation } from '@/utils/animations';

const TAB_BAR_CLEARANCE =
  spacing.huge + spacing.xxxl + spacing.xl;

export default function BookingsScreen() {
  const animatedStyle = useFadeUpAnimation();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Your upcoming adventures</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: fontSizes.xxl,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
});
