import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '@/store/authStore';
import * as chatService from '@/services/chatService';
import type { ChatMessage } from '@/services/chatService';

export function useChat() {
  const user = useAuthStore((state) => state.user);
  const userId = user?._id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (sessId: string) => {
    try {
      const historyData = await chatService.getSessionHistory(sessId);
      const mappedMessages = historyData.history.map((msg, index) => ({
        id: `history_${index}`,
        role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: msg.text,
        timestamp: new Date(),
        isRejected: msg.isRejected,
      }));
      setMessages(mappedMessages);
    } catch {
      // On error (session not found): set messages to empty array, no error shown
      setMessages([]);
    }
  }, []);

  const initSession = useCallback(async (uId: string) => {
    const newSessionId = chatService.generateSessionId(uId);
    setSessionId(newSessionId);
    await AsyncStorage.setItem('tripfusion_chat_session', newSessionId);
    await loadHistory(newSessionId);
  }, [loadHistory]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || !text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const response = await chatService.sendMessage({
        message: text.trim(),
        sessionId,
      });

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.response,
        timestamp: new Date(),
        isRejected: response.isRejected,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, something went wrong. Please try again.',
        isRejected: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId]);

  const clearChat = useCallback(async (sessId: string) => {
    if (!userId) return;
    try {
      await chatService.deleteSession(sessId);
    } catch {
      // Ignore session delete errors, clear locally anyway
    }
    const newSessionId = chatService.generateSessionId(userId);
    await AsyncStorage.setItem('tripfusion_chat_session', newSessionId);
    setMessages([]);
    setSessionId(newSessionId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const checkAndInitSession = async () => {
      try {
        const savedSessionId = await AsyncStorage.getItem('tripfusion_chat_session');
        if (savedSessionId) {
          setSessionId(savedSessionId);
          await loadHistory(savedSessionId);
        } else {
          await initSession(userId);
        }
      } catch {
        setError('Failed to initialize chat session');
      }
    };

    void checkAndInitSession();
  }, [userId, initSession, loadHistory]);

  return {
    messages,
    isTyping,
    sessionId,
    error,
    sendMessage,
    clearChat,
  };
}
