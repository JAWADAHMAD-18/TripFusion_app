import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  shadows,
  spacing,
} from '@/constants/theme';
import type { ChatMessage } from '@/services/chatService';
import { useStaggerAnimation } from '@/utils/animations';

interface ChatBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  index: number;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, index }) => {
  const isUser = message.role === 'user';
  const animatedStyle = useStaggerAnimation(index);

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  if (isUser) {
    return (
      <Animated.View style={[styles.userRow, animatedStyle]}>
        <LinearGradient
          colors={gradients.tealAccent.colors as [string, string, ...string[]]}
          start={gradients.tealAccent.start}
          end={gradients.tealAccent.end}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{message.text}</Text>
          <Text style={styles.userTime}>{formattedTime}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  const isRejected = !!message.isRejected;

  return (
    <Animated.View style={[styles.botRow, animatedStyle]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>AI</Text>
      </View>
      <View style={[styles.botBubble, isRejected && styles.rejectedBubble]}>
        <Text style={[styles.botText, isRejected && styles.rejectedText]}>
          {isRejected ? `⚠️ ${message.text}` : message.text}
        </Text>
        <Text style={styles.botTime}>{formattedTime}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  userRow: {
    alignSelf: 'flex-end',
    marginLeft: '20%',
    marginRight: spacing.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    borderRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.sm,
    padding: spacing.lg,
  },
  userText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  botRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginRight: '20%',
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text.light,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  botBubble: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xxl,
    borderBottomLeftRadius: borderRadius.sm,
    padding: spacing.lg,
    flex: 1,
    ...shadows.sm,
  },
  rejectedBubble: {
    backgroundColor: colors.warning.light,
  },
  botText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
  rejectedText: {
    color: colors.warning.dark,
  },
  botTime: {
    color: colors.text.muted,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
});
