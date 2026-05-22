import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  spacing,
} from '@/constants/theme';
import type { PaymentProofImage } from '@/types/booking';

type BookingPaymentProofProps = {
  paymentProof: PaymentProofImage | null;
  onPick: () => void;
  onRemove: () => void;
  animatedStyle?: AnimatedStyle<ViewStyle>;
};

export function BookingPaymentProof({
  paymentProof,
  onPick,
  onRemove,
  animatedStyle,
}: BookingPaymentProofProps) {
  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Payment proof</Text>
        <View style={styles.requiredBadge}>
          <Text style={styles.requiredText}>Required</Text>
        </View>
      </View>
      <Text style={styles.hint}>
        Upload your bank transfer screenshot before confirming the booking.
      </Text>

      {paymentProof ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: paymentProof.uri }} style={styles.preview} />
          <View style={styles.previewActions}>
            <Pressable style={styles.actionButton} onPress={onPick}>
              <Ionicons name="swap-horizontal" size={fontSizes.md} color={colors.accent.teal} />
              <Text style={styles.actionTextReplace}>Replace</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.removeButton]} onPress={onRemove}>
              <Ionicons name="trash-outline" size={fontSizes.md} color={colors.error.main} />
              <Text style={styles.actionTextRemove}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.uploadArea} onPress={onPick}>
          <Ionicons name="cloud-upload-outline" size={fontSizes.xxxl} color={colors.accent.teal} />
          <Text style={styles.uploadTitle}>Upload payment screenshot</Text>
          <Text style={styles.uploadHint}>JPG or PNG · Tap to select from gallery</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  requiredBadge: {
    backgroundColor: colors.warning.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  requiredText: {
    color: colors.warning.dark,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  hint: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: fontSizes.lg,
  },
  uploadArea: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent.teal,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.success.light,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadTitle: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  uploadHint: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
  },
  previewWrap: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  preview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border.light,
  },
  previewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.paper,
  },
  removeButton: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border.light,
  },
  actionTextReplace: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  actionTextRemove: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
