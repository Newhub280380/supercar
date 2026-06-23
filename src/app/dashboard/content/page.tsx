"use client";

import { useContentGenerator } from "@/hooks/use-content-generator";
import { ContentGeneratorPanel } from "@/components/content/content-generator-panel";
import { ContentPreviewCard, EmptyPreview } from "@/components/content/content-preview-card";
import { ContentLibrary } from "@/components/content/content-library";
import { ContentCalendar } from "@/components/content/content-calendar";
import { PenLine, Library, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ContentTemplateType, ContentType } from "@/types";

type TabId = "generator" | "library" | "calendar";

const TABS: { id: TabId; label: string; icon: typeof PenLine }[] = [
  { id: "generator", label: "Генератор", icon: PenLine },
  { id: "library", label: "Библиотека", icon: Library },
  { id: "calendar", label: "Календарь", icon: CalendarDays },
];

const contentTypeMap: Record<ContentTemplateType, ContentType> = {
  promotion: "post",
  new_procedure: "post",
  review: "post",
  care_tips: "post",
  seasonal: "post",
  seo_description: "seo",
  email_welcome: "email",
  email_reminder: "email",
  email_promo: "email",
  hashtags: "hashtags",
};

export default function ContentPage() {
  const {
    result,
    isLoading,
    error,
    settings,
    setSettings,
    generate,
    regenerate,
    savedItems,
    saveItem,
    deleteItem,
  } = useContentGenerator();

  const [activeTab, setActiveTab] = useState<TabId>("generator");

  const handleSave = () => {
    if (!result) return;
    saveItem({
      platform: settings.platform,
      templateType: settings.templateType,
      contentType: contentTypeMap[settings.templateType],
      title: result.title ?? null,
      content: result.content,
      hashtags: result.hashtags ?? null,
      subjectLine: result.subjectLine ?? null,
      metaDescription: result.metaDescription ?? null,
      tone: settings.tone,
      audience: settings.audience || null,
      topic: settings.topic,
    });
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold">Генератор контента</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-инструмент для создания постов, рассылок и SEO-контента
        </p>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "generator" && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <ContentGeneratorPanel
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={generate}
              isLoading={isLoading}
            />
          </div>

          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {result ? (
              <ContentPreviewCard
                result={result}
                platform={settings.platform}
                isDemo={true}
                onSave={handleSave}
                onRegenerate={regenerate}
                isLoading={isLoading}
              />
            ) : (
              <EmptyPreview />
            )}
          </div>
        </div>
      )}

      {activeTab === "library" && <ContentLibrary items={savedItems} onDelete={deleteItem} />}

      {activeTab === "calendar" && <ContentCalendar />}
    </div>
  );
}
