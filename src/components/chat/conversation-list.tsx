"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Trash2, Clock } from "lucide-react";
import type { Conversation } from "@/hooks/use-chat";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export const ConversationList = memo(function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-heading text-base font-semibold">Диалоги</h2>
        <button
          type="button"
          onClick={onNew}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 size-8 opacity-30" />
            Начните новый диалог
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const date = new Date(conv.updatedAt);
            const timeAgo = getTimeAgo(date);

            return (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(conv.id);
                }}
                className={cn(
                  "group mb-1 flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-all",
                  isActive
                    ? "bg-primary/10 ring-1 ring-primary/20"
                    : "hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <MessageSquare className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {conv.topic || "Новый диалог"}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                      <Clock className="size-3" />
                      {timeAgo}
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {conv.messages?.length || 0} сообщ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "сейчас";
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
