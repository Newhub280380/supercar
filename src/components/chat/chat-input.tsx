"use client";

import { memo, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export const ChatInput = memo(function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, []);

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          tabIndex={-1}
        >
          <Paperclip className="size-4" />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            data-chat-input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Задайте вопрос о косметологии..."
            rows={1}
            disabled={disabled}
            className={cn(
              "w-full resize-none rounded-xl border border-input bg-muted/30 px-4 py-2.5 pr-10 text-sm leading-relaxed outline-none transition-all",
              "placeholder:text-muted-foreground/60",
              "focus:border-ring focus:ring-2 focus:ring-ring/30",
              "disabled:opacity-50",
            )}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-all",
            value.trim() && !disabled
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/80"
              : "bg-muted text-muted-foreground opacity-50",
          )}
        >
          <Send className="size-4" />
        </button>
      </div>
      <p className="mx-auto mt-1.5 max-w-2xl text-center text-[10px] text-muted-foreground">
        AI-консультант носит информационный характер. Обратитесь к специалисту для индивидуального подхода.
      </p>
    </div>
  );
});
