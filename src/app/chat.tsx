import React, { useEffect, useRef } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { colors, fontSizes, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import type { ChatMessage } from '@/services/chatService';

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: "Hi! 👋 I'm your TripFusion travel assistant. Ask me anything about travel destinations, packages, or trip planning in Pakistan!",
  timestamp: new Date(),
};

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { messages, isTyping, sessionId, sendMessage, clearChat } = useChat();

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // Auto-scroll to end on messages length change
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleClear = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear your chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            if (sessionId) {
              void clearChat(sessionId);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => (
    <ChatBubble
      message={item}
      isLast={index === messages.length - 1}
      index={index + 1} // +1 to account for the welcome message
    />
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
        >
          <Ionicons name="chevron-down" color="#ffffff" size={24} />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.titleRow}>
            <View style={styles.activeIndicator} />
            <Text style={styles.headerTitle}>TripFusion AI</Text>
          </View>
          <Text style={styles.headerSubtitle}>Travel Assistant</Text>
        </View>

        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
        >
          <Ionicons name="trash-outline" color="#ffffff" size={20} />
        </Pressable>
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <ChatBubble message={welcomeMessage} isLast={false} index={0} />
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      {/* INPUT */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnPressed: {
    opacity: 0.7,
  },
  headerCenter: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: spacing.xs,
  },
  headerTitle: {
    color: colors.text.light,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
