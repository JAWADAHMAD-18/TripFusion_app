import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  spacing,
} from '@/constants/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const isSendDisabled = !text.trim() || disabled;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Ask me about travel..."
          placeholderTextColor={colors.text.muted}
          multiline
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={isSendDisabled}
        style={({ pressed }) => [
          styles.sendButtonWrap,
          isSendDisabled && styles.disabledSend,
          pressed && !isSendDisabled && styles.pressedSend,
        ]}
      >
        <LinearGradient
          colors={gradients.tealAccent.colors as [string, string, ...string[]]}
          start={gradients.tealAccent.start}
          end={gradients.tealAccent.end}
          style={styles.sendButton}
        >
          <Ionicons name="send" color="#ffffff" size={18} />
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: colors.accent.teal,
  },
  input: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSizes.md,
    paddingVertical: 4,
    maxHeight: 100,
  },
  sendButtonWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSend: {
    opacity: 0.5,
  },
  pressedSend: {
    opacity: 0.85,
  },
});
