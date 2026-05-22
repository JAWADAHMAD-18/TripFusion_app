import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PACKAGE_DETAIL_BOOK_BAR_HEIGHT,
  PACKAGE_DETAIL_HERO_HEIGHT,
} from '@/constants/home';
import { usePulseOpacity } from '@/hooks/use-pulse-opacity';
import { borderRadius, colors, spacing } from '@/constants/theme';

export function PackageDetailSkeleton() {
  const insets = useSafeAreaInsets();
  const pulseStyle = usePulseOpacity();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              PACKAGE_DETAIL_BOOK_BAR_HEIGHT + insets.bottom + spacing.lg,
          },
        ]}
      >
        <Animated.View style={[styles.hero, pulseStyle]} />
        <View style={styles.body}>
          <Animated.View style={[styles.card, pulseStyle]} />
          <Animated.View style={[styles.card, pulseStyle]} />
          <Animated.View style={[styles.cardTall, pulseStyle]} />
          <Animated.View style={[styles.card, pulseStyle]} />
        </View>
      </ScrollView>
      <Animated.View
        style={[
          styles.bookBar,
          { paddingBottom: insets.bottom + spacing.sm },
          pulseStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    height: PACKAGE_DETAIL_HERO_HEIGHT,
    backgroundColor: colors.border.light,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  card: {
    height: 120,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
  },
  cardTall: {
    height: 200,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
  },
  bookBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PACKAGE_DETAIL_BOOK_BAR_HEIGHT,
    backgroundColor: colors.border.light,
  },
});
