"use client";

import {
  BookOpen,
  Trash2,
  Copy,
  Check,
  Camera,
  Send,
  Hash,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TEMPLATE_LABELS } from "@/lib/ai/content-templates";
import { copyToClipboard } from "@/lib/download";
import type { ContentItem, ContentPlatform } from "@/types";
import { useState } from "react";
import { formatDate } from "@/lib/format";

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
          <BookOpen className="text-primary size-4" />
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
          <p className="text-muted-foreground py-8 text-center text-sm">
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

function LibraryItem({
  item,
  onDelete,
}: {
  item: ContentItem;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const PlatformIcon = platformIcons[item.platform];

  const handleCopy = async () => {
    try {
      await copyToClipboard(item.content);
    } catch (err) {
      console.error("Failed to copy content to clipboard:", err);
      setCopyError("Не удалось скопировать текст");
      return;
    }
    setCopyError(null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preview = item.content.slice(0, 120);

  return (
    <div className="group border-border/50 hover:bg-muted/50 rounded-lg border p-3 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5">
          <PlatformIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {item.title || TEMPLATE_LABELS[item.templateType]}
            </span>
          </div>
          <p
            className={cn(
              "text-muted-foreground mt-1 text-xs",
              !expanded && "line-clamp-2",
            )}
          >
            {expanded ? item.content : preview}
            {item.content.length > 120 && !expanded && "..."}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {TEMPLATE_LABELS[item.templateType]}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
              <Clock className="size-3" />
              {formatDate(item.createdAt)}
            </span>
            {expanded && item.content.length > 120 && (
              <button
                onClick={() => setExpanded(false)}
                className="text-primary text-[10px] hover:underline"
              >
                Свернуть
              </button>
            )}
            {!expanded && item.content.length > 120 && (
              <button
                onClick={() => setExpanded(true)}
                className="text-primary text-[10px] hover:underline"
              >
                Развернуть
              </button>
            )}
          </div>
          {copyError && (
            <p className="text-destructive mt-1 text-[10px]">{copyError}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
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
