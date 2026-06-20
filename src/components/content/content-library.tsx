"use client";

import { BookOpen, Trash2, Copy, Check, Camera, Send, Hash, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TEMPLATE_LABELS } from "@/lib/ai/content-templates";
import { copyToClipboard } from "@/lib/export-utils";
import type { ContentItem, ContentPlatform } from "@/types";
import { useState } from "react";

interface ContentLibraryProps {
  items: ContentItem[];
  onDelete: (id: string) => void;
}

const platformIcons: Record<ContentPlatform, typeof Camera> = {
  instagram: Camera,
  telegram: Send,
  vk: Hash,
};

export function ContentLibrary({ items, onDelete }: ContentLibraryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <BookOpen className="size-4 text-primary" />
          Библиотека контента
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {items.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Сохранённых текстов пока нет
          </p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 20).map((item) => (
              <LibraryItem key={item.id} item={item} onDelete={onDelete} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LibraryItem({ item, onDelete }: { item: ContentItem; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const PlatformIcon = platformIcons[item.platform];

  const handleCopy = async () => {
    await copyToClipboard(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preview = item.content.slice(0, 120);

  return (
    <div className="group rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">
          <PlatformIcon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {item.title || TEMPLATE_LABELS[item.templateType]}
            </span>
          </div>
          <p className={cn("mt-1 text-xs text-muted-foreground", !expanded && "line-clamp-2")}>
            {expanded ? item.content : preview}
            {item.content.length > 120 && !expanded && "..."}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {TEMPLATE_LABELS[item.templateType]}
            </Badge>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="size-3" />
              {new Date(item.createdAt).toLocaleDateString("ru-RU")}
            </span>
            {expanded && item.content.length > 120 && (
              <button
                onClick={() => setExpanded(false)}
                className="text-[10px] text-primary hover:underline"
              >
                Свернуть
              </button>
            )}
            {!expanded && item.content.length > 120 && (
              <button
                onClick={() => setExpanded(true)}
                className="text-[10px] text-primary hover:underline"
              >
                Развернуть
              </button>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
            {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(item.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
