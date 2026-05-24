import api from '@/services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isRejected?: boolean;
}

export interface SendMessagePayload {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  isJson: boolean;
  isRejected: boolean;
  sessionId: string;
  timestamp: string;
}

export interface SessionHistory {
  success: boolean;
  sessionId: string;
  messageCount: number;
  history: { role: string; text: string; isRejected?: boolean }[];
  expiresIn: string;
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>('/chat/chat', payload);
  return response.data;
}

export async function getSessionHistory(sessionId: string): Promise<SessionHistory> {
  const response = await api.get<SessionHistory>(`/chat/session/${sessionId}`);
  return response.data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/chat/session/${sessionId}`);
}

export function generateSessionId(userId: string): string {
  return `tripfusion_chat_${userId}_${Date.now()}`;
}
