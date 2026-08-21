"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  isStreaming: boolean;
  error: string | null;
  tone: "professional" | "friendly";
  skinType: SkinType | null;
  concerns: string[];
  relatedProcedures: string[];
  relatedFAQ: string[];
}

const ACTIVE_CONV_KEY = "chat-active-conversation-id";

const log = {
  info: (...args: unknown[]) => console.log("[useChat]", ...args),
  error: (...args: unknown[]) => console.error("[useChat]", ...args),
};

function toMessage(m: unknown): Message {
  const raw = m as Partial<Message>;
  return {
    id:
      typeof raw?.id === "string"
        ? raw.id
        : `msg-${Math.random().toString(36).slice(2)}`,
    role: raw?.role === "assistant" ? "assistant" : "user",
    content: typeof raw?.content === "string" ? raw.content : "",
    timestamp:
      typeof raw?.timestamp === "string"
        ? raw.timestamp
        : new Date().toISOString(),
  };
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    tone: "professional",
    skinType: null,
    concerns: [],
    relatedProcedures: [],
    relatedFAQ: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", {
        signal: abortRef.current?.signal,
      });
      if (!res.ok) {
        throw new Error(`Failed to load conversations: ${res.status}`);
      }

      const data = await res.json();
      const conversations: Conversation[] = Array.isArray(data.conversations)
        ? data.conversations.map((c: unknown) => {
            const conv = c as Partial<Conversation>;
            return {
              id: String(conv?.id ?? ""),
              topic: conv?.topic ?? null,
              messages: Array.isArray(conv?.messages)
                ? conv.messages.map(toMessage)
                : [],
              createdAt: conv?.createdAt ?? new Date().toISOString(),
              updatedAt: conv?.updatedAt ?? new Date().toISOString(),
            };
          })
        : [];

      setState((s) => {
        const activeId = s.activeConversationId;
        let messages = s.messages;

        if (activeId && messages.length === 0) {
          const active = conversations.find((c) => c.id === activeId);
          if (active) {
            messages = active.messages;
          }
        }

        return { ...s, conversations, messages };
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      log.error("fetchConversations failed", err);
      setState((s) => ({
        ...s,
        error: "Не удалось загрузить историю диалогов",
      }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    queueMicrotask(() => {
      try {
        const savedId = localStorage.getItem(ACTIVE_CONV_KEY);
        if (savedId) {
          setState((s) => ({ ...s, activeConversationId: savedId }));
        }
      } catch {
        // localStorage unavailable
      }
    });
  }, []);

  const selectConversation = useCallback((convId: string) => {
    setState((s) => {
      const conv = s.conversations.find((c) => c.id === convId);
      if (!conv) return s;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(ACTIVE_CONV_KEY, convId);
        } catch {
          // ignore
        }
      }
      return {
        ...s,
        activeConversationId: convId,
        messages: conv.messages,
        error: null,
        relatedProcedures: [],
        relatedFAQ: [],
      };
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.isLoading) return;

      const now = Date.now();
      const optimisticMessage: Message = {
        id: `temp-${now}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      const assistantId = `stream-${now}`;
      const assistantPlaceholder: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        messages: [...s.messages, optimisticMessage, assistantPlaceholder],
        isLoading: true,
        isStreaming: true,
        error: null,
        relatedProcedures: [],
        relatedFAQ: [],
      }));

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const removeOptimistic = () =>
        setState((s) => ({
          ...s,
          messages: s.messages.filter(
            (m) => m.id !== optimisticMessage.id && m.id !== assistantId,
          ),
        }));

      try {
        const res = await fetch("/api/chat/stream", {
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
          removeOptimistic();
          setState((s) => ({
            ...s,
            isLoading: false,
            isStreaming: false,
            error: "Слишком много запросов. Подождите минуту.",
          }));
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          log.error("chat request failed", res.status, err);
          removeOptimistic();
          setState((s) => ({
            ...s,
            isLoading: false,
            isStreaming: false,
            error: err?.error || "Ошибка отправки",
          }));
          return;
        }

        if (!res.body) {
          removeOptimistic();
          setState((s) => ({
            ...s,
            isLoading: false,
            isStreaming: false,
            error: "Потоковый ответ недоступен",
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedAnyToken = false;
        let finalConversationId = state.activeConversationId;
        let finalRelatedProcedures: string[] = [];
        let finalRelatedFAQ: string[] = [];

        const handleEvent = (raw: string) => {
          const lines = raw.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload) continue;
            try {
              const event = JSON.parse(payload);
              if (event.type === "ready" && event.conversationId) {
                finalConversationId = event.conversationId;
                setState((s) => ({
                  ...s,
                  activeConversationId: event.conversationId,
                }));
              } else if (
                event.type === "token" &&
                typeof event.token === "string"
              ) {
                receivedAnyToken = true;
                setState((s) => ({
                  ...s,
                  isLoading: false,
                  messages: s.messages.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + event.token }
                      : m,
                  ),
                }));
              } else if (event.type === "done") {
                if (event.conversationId)
                  finalConversationId = event.conversationId;
                if (Array.isArray(event.relatedProcedures)) {
                  finalRelatedProcedures = event.relatedProcedures.filter(
                    (p: unknown) => typeof p === "string",
                  );
                }
                if (Array.isArray(event.relatedFAQ)) {
                  finalRelatedFAQ = event.relatedFAQ.filter(
                    (q: unknown) => typeof q === "string",
                  );
                }
                const reply =
                  typeof event.reply === "string" && event.reply
                    ? event.reply
                    : null;
                setState((s) => ({
                  ...s,
                  activeConversationId: finalConversationId,
                  isLoading: false,
                  isStreaming: false,
                  relatedProcedures: finalRelatedProcedures,
                  relatedFAQ: finalRelatedFAQ,
                  messages: s.messages.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          id: `msg-${Date.now()}-assistant`,
                          content: reply ?? m.content,
                          timestamp: new Date().toISOString(),
                        }
                      : m.id === optimisticMessage.id
                        ? { ...m, id: `msg-${Date.now()}-user` }
                        : m,
                  ),
                }));
              } else if (event.type === "error") {
                removeOptimistic();
                setState((s) => ({
                  ...s,
                  isLoading: false,
                  isStreaming: false,
                  error:
                    typeof event.error === "string"
                      ? event.error
                      : "Внутренняя ошибка сервера",
                }));
              }
            } catch {
              // ignore malformed SSE line
            }
          }
        };

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            handleEvent(part);
          }
        }

        if (buffer.trim()) {
          handleEvent(buffer);
        }

        if (!receivedAnyToken) {
          setState((s) => ({
            ...s,
            isLoading: false,
            isStreaming: false,
            messages: s.messages.map((m) =>
              m.id === assistantId && !m.content
                ? { ...m, content: "Извините, не удалось получить ответ." }
                : m,
            ),
          }));
        }

        if (finalConversationId && typeof window !== "undefined") {
          try {
            localStorage.setItem(ACTIVE_CONV_KEY, finalConversationId);
          } catch {
            // ignore
          }
        }

        await fetchConversations();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          setState((s) => ({
            ...s,
            isLoading: false,
            isStreaming: false,
          }));
          return;
        }
        log.error("sendMessage failed", err);
        removeOptimistic();
        setState((s) => ({
          ...s,
          isLoading: false,
          isStreaming: false,
          error: "Ошибка сети",
        }));
      }
    },
    [
      state.activeConversationId,
      state.isLoading,
      state.tone,
      state.skinType,
      state.concerns,
      fetchConversations,
    ],
  );

  const startNewConversation = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(ACTIVE_CONV_KEY);
      } catch {
        // ignore
      }
    }
    setState((s) => ({
      ...s,
      activeConversationId: null,
      messages: [],
      error: null,
      relatedProcedures: [],
      relatedFAQ: [],
    }));
  }, []);

  const deleteConversation = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations?id=${convId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to delete conversation: ${res.status}`);
      }
      setState((s) => {
        const isActive = s.activeConversationId === convId;
        if (isActive && typeof window !== "undefined") {
          try {
            localStorage.removeItem(ACTIVE_CONV_KEY);
          } catch {
            // ignore
          }
        }
        return {
          ...s,
          error: null,
          conversations: s.conversations.filter((c) => c.id !== convId),
          ...(isActive
            ? {
                activeConversationId: null,
                messages: [],
                relatedProcedures: [],
                relatedFAQ: [],
              }
            : {}),
        };
      });
    } catch (err) {
      log.error("deleteConversation failed", err);
      setState((s) => ({ ...s, error: "Не удалось удалить диалог" }));
    }
  }, []);

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

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    ...state,
    fetchConversations,
    selectConversation,
    sendMessage,
    stopStreaming,
    startNewConversation,
    deleteConversation,
    setTone,
    setSkinType,
    setConcerns,
    clearError,
  };
}
