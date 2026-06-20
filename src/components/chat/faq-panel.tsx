"use client";

import { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, ChevronDown, ChevronRight, Search } from "lucide-react";

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQPanelProps {
  onAskQuestion: (question: string) => void;
}

export const FAQPanel = memo(function FAQPanel({ onAskQuestion }: FAQPanelProps) {
  const [items, setItems] = useState<FAQEntry[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const url = search
          ? `/api/faq?q=${encodeURIComponent(search)}`
          : "/api/faq";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-4 pb-2">
        <HelpCircle className="size-4 text-muted-foreground" />
        <h3 className="font-heading text-sm font-semibold">FAQ</h3>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по FAQ..."
            className="w-full rounded-lg border border-border bg-muted/30 py-1.5 pl-8 pr-3 text-xs outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs text-muted-foreground">Загрузка...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Ничего не найдено
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="mb-1">
              <button
                type="button"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors",
                  expanded === item.id
                    ? "bg-primary/5 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {expanded === item.id ? (
                    <ChevronDown className="size-3" />
                  ) : (
                    <ChevronRight className="size-3" />
                  )}
                </span>
                <span className="flex-1 leading-relaxed">{item.question}</span>
              </button>
              {expanded === item.id && (
                <div className="mx-3 mb-2 ml-7 rounded-lg bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {item.answer}
                  <button
                    type="button"
                    onClick={() => {
                      onAskQuestion(item.question);
                    }}
                    className="mt-2 block text-primary hover:underline"
                  >
                    Задать этот вопрос AI →
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
