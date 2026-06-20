"use client";

import { memo, useState, useCallback, useEffect } from "react";
import type { Message } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, FileDown, X } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  relatedProcedures?: string[];
  relatedFAQ?: string[];
  onClearError: () => void;
}

export const ChatMessages = memo(function ChatMessages({
  messages,
  isLoading,
  error,
  conversationId,
  relatedProcedures,
  relatedFAQ,
  onClearError,
}: ChatMessagesProps) {
  const messagesEndRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    },
    [],
  );

  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (messages.length > 0) setShowSuggestions(false);
  }, [messages.length]);

  const handleExport = async () => {
    if (!conversationId) return;
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recommendations-${conversationId}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        {messages.length === 0 && showSuggestions ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-gold/20 to-blush">
              <span className="text-2xl">🌸</span>
            </div>
            <h2 className="font-heading text-xl font-semibold">
              AI-Консультант по косметологии
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
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
                  className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-left text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                  onClick={() => {
                    const input = document.querySelector(
                      "[data-chat-input]",
                    ) as HTMLTextAreaElement | null;
                    if (input) {
                      input.value = q;
                      input.focus();
                      input.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLatest={index === messages.length - 1}
              />
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-gold/20 to-blush">
                  <Loader2 className="size-4 animate-spin" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3 ring-1 ring-border/50">
                  <div className="flex gap-1.5">
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
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

      {relatedProcedures && relatedProcedures.length > 0 && messages.length > 0 && (
        <div
          className={cn(
            "border-t bg-muted/30 px-4 py-3 transition-all",
            relatedProcedures.length === 0 && "hidden",
          )}
        >
          <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Связанные процедуры:</span>
            {relatedProcedures.slice(0, 4).map((name) => (
              <span
                key={name}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {(relatedFAQ?.length ?? 0) > 0 && messages.length > 0 && (
        <div className="border-t bg-muted/20 px-4 py-2">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">FAQ:</span>
            {relatedFAQ!.slice(0, 3).map((q) => (
              <span
                key={q}
                className="rounded-full bg-accent/30 px-2.5 py-0.5 text-xs text-accent-foreground"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {conversationId && messages.length > 2 && (
        <div className="border-t bg-background px-4 py-2">
          <div className="mx-auto flex max-w-2xl justify-end">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
