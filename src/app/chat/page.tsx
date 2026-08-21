"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput, type ChatInputHandle } from "@/components/chat/chat-input";
import { ChatSettings } from "@/components/chat/chat-settings";
import { FAQPanel } from "@/components/chat/faq-panel";
import { ErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import {
  Bot,
  Menu,
  Settings2,
  HelpCircle,
  X,
  PanelLeftClose,
} from "lucide-react";

type RightPanel = "settings" | "faq" | null;

export default function ChatPage() {
  const chat = useChat();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);
  const inputRef = useRef<ChatInputHandle>(null);

  useEffect(() => {
    chat.fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(
    async (message: string) => {
      await chat.sendMessage(message);
    },
    [chat],
  );

  const handleStop = useCallback(() => {
    chat.stopStreaming();
  }, [chat]);

  const handleAskQuestion = useCallback((question: string) => {
    inputRef.current?.setValue(question);
    inputRef.current?.focus();
    setRightPanel(null);
    setMobileRight(false);
  }, []);

  const openRightPanel = useCallback((panel: RightPanel) => {
    setRightPanel((prev) => (prev === panel ? null : panel));
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              typeof window !== "undefined" && window.innerWidth < 768
                ? setMobileLeft(!mobileLeft)
                : setLeftOpen(!leftOpen)
            }
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {leftOpen ? <PanelLeftClose className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-primary" />
            <h1 className="font-heading text-sm font-semibold">AI-Консультант</h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openRightPanel("faq")}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              rightPanel === "faq"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <HelpCircle className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => openRightPanel("settings")}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              rightPanel === "settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Settings2 className="size-4" />
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {mobileLeft && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setMobileLeft(false)}
          />
        )}

        <aside
          className={cn(
            "z-40 w-72 shrink-0 border-r bg-card transition-all md:relative md:z-auto",
            typeof window !== "undefined" && window.innerWidth < 768
              ? cn(
                  "fixed inset-y-0 left-0 border-r",
                  mobileLeft ? "translate-x-0" : "-translate-x-full",
                )
              : leftOpen
                ? "w-72"
                : "w-0 overflow-hidden border-r-0",
          )}
        >
          <ConversationList
            conversations={chat.conversations}
            activeId={chat.activeConversationId}
            onSelect={(id) => {
              chat.selectConversation(id);
              setMobileLeft(false);
            }}
            onNew={chat.startNewConversation}
            onDelete={chat.deleteConversation}
          />
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden bg-background">
          <ErrorBoundary resetKey={chat.activeConversationId}>
            <ChatMessages
              messages={chat.messages}
              isLoading={chat.isLoading}
              error={chat.error}
              conversationId={chat.activeConversationId}
              relatedProcedures={chat.relatedProcedures}
              relatedFAQ={chat.relatedFAQ}
              onClearError={chat.clearError}
              onSuggestionClick={handleAskQuestion}
            />
          </ErrorBoundary>
          <ChatInput
            ref={inputRef}
            onSend={handleSend}
            onStop={handleStop}
            disabled={chat.isLoading}
            isStreaming={chat.isStreaming}
          />
        </main>

        {mobileRight && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setMobileRight(false)}
          />
        )}

        {rightPanel && (
          <aside
            className={cn(
              "z-40 w-80 shrink-0 border-l bg-card transition-all md:relative md:z-auto",
              typeof window !== "undefined" && window.innerWidth < 768
                ? cn(
                    "fixed inset-y-0 right-0 border-l",
                    mobileRight ? "translate-x-0" : "translate-x-full",
                  )
                : "w-80",
            )}
          >
            <div className="relative h-full">
              {rightPanel === "settings" && (
                <ChatSettings
                  tone={chat.tone}
                  skinType={chat.skinType}
                  concerns={chat.concerns}
                  onToneChange={chat.setTone}
                  onSkinTypeChange={chat.setSkinType}
                  onConcernsChange={chat.setConcerns}
                  onClose={() => openRightPanel(null)}
                />
              )}
              {rightPanel === "faq" && (
                <div className="relative h-full pt-8">
                  <button
                    type="button"
                    onClick={() => openRightPanel(null)}
                    className="absolute right-3 top-2 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                  <FAQPanel onAskQuestion={handleAskQuestion} />
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
