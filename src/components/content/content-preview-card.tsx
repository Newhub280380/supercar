"use client";

import { Copy, Save, RefreshCw, FileText, Check, Camera, Send, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard, exportAsTXT, exportAsHTML, getWordCount, getCharCount } from "@/lib/export-utils";
import type { ContentGenerationResult, ContentPlatform } from "@/types";
import { useState } from "react";

interface ContentPreviewCardProps {
  result: ContentGenerationResult;
  platform: ContentPlatform;
  isDemo?: boolean;
  onSave: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

const platformStyles: Record<ContentPlatform, { border: string; headerBg: string; label: string }> = {
  instagram: {
    border: "border-pink-200 dark:border-pink-900/30",
    headerBg: "bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20",
    label: "Instagram",
  },
  telegram: {
    border: "border-blue-200 dark:border-blue-900/30",
    headerBg: "bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20",
    label: "Telegram",
  },
  vk: {
    border: "border-sky-200 dark:border-sky-900/30",
    headerBg: "bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20",
    label: "ВКонтакте",
  },
};

const platformIcons = {
  instagram: Camera,
  telegram: Send,
  vk: Hash,
};

export function ContentPreviewCard({
  result,
  platform,
  isDemo,
  onSave,
  onRegenerate,
  isLoading,
}: ContentPreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const style = platformStyles[platform];
  const PlatformIcon = platformIcons[platform];

  const handleCopy = async () => {
    await copyToClipboard(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filename = result.title?.slice(0, 30)?.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_") || "content";

  return (
    <div className="space-y-4">
      <Card className={cn("overflow-hidden", style.border)}>
        <div className={cn("border-b px-4 py-3", style.headerBg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlatformIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{style.label}</span>
              {result.subjectLine && (
                <span className="text-xs text-muted-foreground">
                  — {result.subjectLine}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{getWordCount(result.content)} слов</span>
              <span>·</span>
              <span>{getCharCount(result.content)} симв.</span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
            {result.content}
          </pre>
        </CardContent>
      </Card>

      {result.hashtags && result.hashtags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Hash className="size-3" />
              Хештеги ({result.hashtags.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1.5">
              {result.hashtags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.metaDescription && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Meta Description
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{result.metaDescription}</p>
          </CardContent>
        </Card>
      )}

      {isDemo && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
          Демо-режим. Укажите OPENAI_API_KEY для генерации с помощью AI.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-green-500" /> Скопировано
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Copy className="size-3.5" /> Копировать
            </span>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={handleSave}>
          {saved ? (
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-green-500" /> Сохранено
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="size-3.5" /> В библиотеку
            </span>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportAsTXT(result.content, filename)}>
          <FileText className="size-3.5" /> TXT
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportAsHTML(result.content, filename)}>
          <FileText className="size-3.5" /> HTML
        </Button>
        <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isLoading}>
          <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} /> Заново
        </Button>
      </div>
    </div>
  );
}

export function EmptyPreview() {
  return (
    <Card className="flex min-h-[400px] items-center justify-center border-dashed">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-muted">
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Предпросмотр контента</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Настройте генератор и нажмите «Сгенерировать»
        </p>
      </div>
    </Card>
  );
}
