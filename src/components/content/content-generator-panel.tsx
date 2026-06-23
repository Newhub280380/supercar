"use client";

import { Sparkles, Camera, Send, Hash, PenLine, Mail, Search, Tag, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  contentTemplates,
  PLATFORM_LABELS,
  TONE_LABELS,
} from "@/lib/ai/content-templates";
import type { ContentGenerationSettings } from "@/hooks/use-content-generator";
import { useState } from "react";

interface ContentGeneratorPanelProps {
  settings: ContentGenerationSettings;
  onSettingsChange: (settings: ContentGenerationSettings) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const platformIcons = {
  instagram: Camera,
  telegram: Send,
  vk: Hash,
};

const contentTypeIcons: Record<string, typeof Sparkles> = {
  promotion: Sparkles,
  new_procedure: PenLine,
  review: PenLine,
  care_tips: PenLine,
  seasonal: Sparkles,
  seo_description: Search,
  email_welcome: Mail,
  email_reminder: Mail,
  email_promo: Mail,
  hashtags: Tag,
};

const lengthOptions: { value: "short" | "medium" | "long"; label: string }[] = [
  { value: "short", label: "Короткий" },
  { value: "medium", label: "Средний" },
  { value: "long", label: "Длинный" },
];

export function ContentGeneratorPanel({
  settings,
  onSettingsChange,
  onGenerate,
  isLoading,
}: ContentGeneratorPanelProps) {
  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !settings.seoKeywords.includes(keywordInput.trim())) {
      onSettingsChange({
        ...settings,
        seoKeywords: [...settings.seoKeywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    onSettingsChange({
      ...settings,
      seoKeywords: settings.seoKeywords.filter((k) => k !== kw),
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Settings2 className="size-4 text-primary" />
          Настройки генерации
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Платформа
          </label>
          <div className="flex gap-2">
            {(Object.entries(PLATFORM_LABELS) as [typeof settings.platform, string][]).map(
              ([key, label]) => {
                const Icon = platformIcons[key];
                return (
                  <button
                    key={key}
                    onClick={() => onSettingsChange({ ...settings, platform: key })}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all",
                      settings.platform === key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Тип контента
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {contentTemplates.map((template) => {
              const Icon = contentTypeIcons[template.id] || Sparkles;
              return (
                <button
                  key={template.id}
                  onClick={() => onSettingsChange({ ...settings, templateType: template.id })}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all",
                    settings.templateType === template.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{template.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Тон
          </label>
          <div className="flex gap-2">
            {(Object.entries(TONE_LABELS) as [typeof settings.tone, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => onSettingsChange({ ...settings, tone: key })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                    settings.tone === key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Длина
          </label>
          <div className="flex gap-2">
            {lengthOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSettingsChange({ ...settings, length: opt.value })}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                  settings.length === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Тема / Описание *
          </label>
          <textarea
            value={settings.topic}
            onChange={(e) => onSettingsChange({ ...settings, topic: e.target.value })}
            placeholder="Например: Весенняя акция на биоревитализацию — скидка 30% для новых клиентов"
            className="min-h-[80px] w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Целевая аудитория
          </label>
          <Input
            value={settings.audience}
            onChange={(e) => onSettingsChange({ ...settings, audience: e.target.value })}
            placeholder="Женщины 25-45 лет, интересующиеся anti-age"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Услуга / Процедура
          </label>
          <Input
            value={settings.service}
            onChange={(e) => onSettingsChange({ ...settings, service: e.target.value })}
            placeholder="Биоревитализация, химический пилинг..."
          />
        </div>

        {settings.templateType === "seo_description" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              SEO-ключевые слова
            </label>
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                placeholder="косметолог, уход за кожей"
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleAddKeyword}>
                Добавить
              </Button>
            </div>
            {settings.seoKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {settings.seoKeywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="gap-1">
                    {kw}
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="ml-0.5 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={onGenerate}
          disabled={isLoading || !settings.topic.trim()}
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Генерация...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="size-4" />
              Сгенерировать
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
