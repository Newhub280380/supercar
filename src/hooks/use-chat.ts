"use client";

import { useState, useCallback, useRef } from "react";
import type { SkinType } from "@/types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  topic: string | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  tone: "professional" | "friendly";
  skinType: SkinType | null;
  concerns: string[];
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoading: false,
    error: null,
    tone: "professional",
    skinType: null,
    concerns: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setState((s) => ({ ...s, conversations: data.conversations }));
      }
    } catch {
      // ignore
    }
  }, []);

  const selectConversation = useCallback(
    (convId: string) => {
      const conv = state.conversations.find((c) => c.id === convId);
      if (conv) {
        setState((s) => ({
          ...s,
          activeConversationId: convId,
          messages: conv.messages,
          error: null,
        }));
      }
    },
    [state.conversations],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.isLoading) return;

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        messages: [...s.messages, optimisticMessage],
        isLoading: true,
        error: null,
      }));

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: state.activeConversationId,
            message: content,
            tone: state.tone,
            skinType: state.skinType,
            concerns: state.concerns,
          }),
          signal: abortRef.current.signal,
        });

        if (res.status === 429) {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: "Слишком много запросов. Подождите минуту.",
            messages: s.messages.filter((m) => m.id !== optimisticMessage.id),
          }));
          return;
        }

        if (!res.ok) {
          const err = await res.json();
          setState((s) => ({
            ...s,
            isLoading: false,
            error: err.error || "Ошибка отправки",
            messages: s.messages.filter((m) => m.id !== optimisticMessage.id),
          }));
          return;
        }

        const data = await res.json();

        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        setState((s) => ({
          ...s,
          activeConversationId: data.conversationId || s.activeConversationId,
          messages: [
            ...s.messages.map((m) =>
              m.id === optimisticMessage.id
                ? { ...m, id: `msg-${Date.now()}-user` }
                : m,
            ),
            assistantMessage,
          ],
          isLoading: false,
          error: null,
        }));

        await fetchConversations();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setState((s) => ({
          ...s,
          isLoading: false,
          error: "Ошибка сети",
          messages: s.messages.filter((m) => m.id !== optimisticMessage.id),
        }));
      }
    },
    [state.activeConversationId, state.isLoading, state.tone, state.skinType, state.concerns, fetchConversations],
  );

  const startNewConversation = useCallback(() => {
    setState((s) => ({
      ...s,
      activeConversationId: null,
      messages: [],
      error: null,
    }));
  }, []);

  const deleteConversation = useCallback(
    async (convId: string) => {
      try {
        await fetch(`/api/conversations?id=${convId}`, { method: "DELETE" });
        setState((s) => ({
          ...s,
          conversations: s.conversations.filter((c) => c.id !== convId),
          ...(s.activeConversationId === convId
            ? { activeConversationId: null, messages: [] }
            : {}),
        }));
      } catch {
        // ignore
      }
    },
    [],
  );

  const setTone = useCallback((tone: "professional" | "friendly") => {
    setState((s) => ({ ...s, tone }));
  }, []);

  const setSkinType = useCallback((skinType: SkinType | null) => {
    setState((s) => ({ ...s, skinType }));
  }, []);

  const setConcerns = useCallback((concerns: string[]) => {
    setState((s) => ({ ...s, concerns }));
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    fetchConversations,
    selectConversation,
    sendMessage,
    startNewConversation,
    deleteConversation,
    setTone,
    setSkinType,
    setConcerns,
    clearError,
  };
}
