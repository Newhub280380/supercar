"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { Message } from "@/hooks/use-chat";

function MarkdownContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*.*?\*\*|\n|###.*?\n)/);

  return (
    <div className="space-y-1">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("### ")) {
          return (
            <h3 key={i} className="mt-2 font-heading text-sm font-semibold">
              {part.slice(4).trim()}
            </h3>
          );
        }
        if (part === "\n") {
          return <br key={i} />;
        }
        if (part.startsWith("- ")) {
          return (
            <div key={i} className="ml-3 flex gap-1.5">
              <span className="text-primary">•</span>
              <span>{part.slice(2)}</span>
            </div>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export const ChatMessage = memo(function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isUser = message.role === "user";
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      data-latest={isLatest ? "true" : undefined}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-rose-gold/20 to-blush text-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div
        className={cn(
          "group relative max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/60 text-foreground rounded-tl-sm ring-1 ring-border/50",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}
        {time && (
          <div
            className={cn(
              "mt-1 text-[10px] opacity-50",
              isUser ? "text-right" : "text-left",
            )}
          >
            {time}
          </div>
        )}
      </div>
    </div>
  );
});
