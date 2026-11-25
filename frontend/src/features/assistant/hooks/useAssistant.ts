import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@shared/api/errors';
import { useAuth } from '@features/auth';
import { assistantApi } from '../api/assistant.api';
import type { ChatMessage } from '../model/types';

const STORAGE_PREFIX = 'taxicoop.assistant.history';

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function loadHistory(storageKey: string): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function useAssistant() {
  const { user } = useAuth();
  // La conversacion se guarda por usuario para no mezclar sesiones en el mismo navegador.
  const storageKey = `${STORAGE_PREFIX}:${user?.email ?? 'anonimo'}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory(storageKey));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<ChatMessage[]>(messages);

  const updateMessages = useCallback((next: ChatMessage[]) => {
    historyRef.current = next;
    setMessages(next);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-24)));
    } catch {
      /* sessionStorage puede estar bloqueado: la conversacion sigue en memoria */
    }
  }, [messages, storageKey]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isSending) return;

      const outgoing: ChatMessage[] = [...historyRef.current, createMessage('user', question)];
      updateMessages(outgoing);
      setError(null);
      setIsSending(true);

      try {
        const reply = await assistantApi.chat(
          outgoing.map((message) => ({ role: message.role, content: message.content })),
        );
        updateMessages([...historyRef.current, createMessage('assistant', reply.reply)]);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudo contactar al asistente.'));
      } finally {
        setIsSending(false);
      }
    },
    [isSending, updateMessages],
  );

  const reset = useCallback(() => {
    updateMessages([]);
    setError(null);
  }, [updateMessages]);

  return { messages, isSending, error, send, reset };
}
