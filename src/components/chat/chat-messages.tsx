"use client";

import { memo, useState, useCallback, useEffect } from "react";
import type { Message } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { cn } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import { Loader2, AlertCircle, FileDown, X } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  relatedProcedures?: string[];
  relatedFAQ?: string[];
  onClearError: () => void;
  onSuggestionClick?: (question: string) => void;
}

export const ChatMessages = memo(function ChatMessages({
  messages,
  isLoading,
  error,
  conversationId,
  relatedProcedures,
  relatedFAQ,
  onClearError,
  onSuggestionClick,
}: ChatMessagesProps) {
  const messagesEndRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length > 0) setShowSuggestions(false);
  }, [messages.length]);

  const handleExport = async () => {
    if (!conversationId) return;
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`);
      }
      downloadBlob(await res.blob(), `recommendations-${conversationId}.html`);
      setExportError(null);
    } catch (err) {
      console.error("Failed to export conversation:", err);
      setExportError("Не удалось экспортировать диалог");
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        {messages.length === 0 && showSuggestions ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="from-rose-gold/20 to-blush mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br">
              <span className="text-2xl">🌸</span>
            </div>
            <h2 className="font-heading text-xl font-semibold">
              AI-Консультант по косметологии
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              Задайте вопрос о процедурах, уходе за кожей, филлерах, пилингах
            </p>
            <div className="mt-6 grid max-w-md grid-cols-2 gap-2">
              {[
                "Какая процедура подходит для сухой кожи?",
                "Как часто делать чистку лица?",
                "Что такое биоревитализация?",
                "Рекомендации по уходу за жирной кожей",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  className="border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground rounded-xl border px-3 py-2.5 text-left text-xs transition-all"
                  onClick={() => onSuggestionClick?.(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages
              .filter((msg) => msg.role === "user" || msg.content.length > 0)
              .map((msg, index, filtered) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLatest={index === filtered.length - 1}
                />
              ))}

            {isLoading && (
              <div className="animate-fade-in flex gap-3">
                <div className="from-rose-gold/20 to-blush flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br">
                  <Loader2 className="size-4 animate-spin" />
                </div>
                <div className="bg-muted/60 ring-border/50 rounded-2xl rounded-tl-sm px-4 py-3 ring-1">
                  <div className="flex gap-1.5">
                    <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full [animation-delay:0ms]" />
                    <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full [animation-delay:150ms]" />
                    <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {exportError && (
        <div className="bg-destructive/10 text-destructive mx-4 mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive mx-4 mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={onClearError}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {relatedProcedures &&
        relatedProcedures.length > 0 &&
        messages.length > 0 && (
          <div
            className={cn(
              "bg-muted/30 border-t px-4 py-3 transition-all",
              relatedProcedures.length === 0 && "hidden",
            )}
          >
            <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                Связанные процедуры:
              </span>
              {relatedProcedures.slice(0, 4).map((name) => (
                <span
                  key={name}
                  className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

      {(relatedFAQ?.length ?? 0) > 0 && messages.length > 0 && (
        <div className="bg-muted/20 border-t px-4 py-2">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">FAQ:</span>
            {relatedFAQ!.slice(0, 3).map((q) => (
              <span
                key={q}
                className="bg-accent/30 text-accent-foreground rounded-full px-2.5 py-0.5 text-xs"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {conversationId && messages.length > 2 && (
        <div className="bg-background border-t px-4 py-2">
          <div className="mx-auto flex max-w-2xl justify-end">
            <button
              type="button"
              onClick={handleExport}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors"
            >
              <FileDown className="size-3.5" />
              Экспорт в PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
