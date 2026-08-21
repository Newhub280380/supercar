"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  ContentGenerationRequest,
  ContentGenerationResult,
  ContentPlatform,
  ContentTemplateType,
  ContentTone,
  ContentItem,
} from "@/types";

interface UseContentGeneratorReturn {
  result: ContentGenerationResult | null;
  isLoading: boolean;
  error: string | null;
  settings: ContentGenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<ContentGenerationSettings>>;
  generate: () => Promise<void>;
  regenerate: () => Promise<void>;
  savedItems: ContentItem[];
  saveItem: (item: Omit<ContentItem, "id" | "createdAt">) => void;
  deleteItem: (id: string) => void;
}

export interface ContentGenerationSettings {
  platform: ContentPlatform;
  templateType: ContentTemplateType;
  topic: string;
  audience: string;
  tone: ContentTone;
  length: "short" | "medium" | "long";
  service: string;
  seoKeywords: string[];
}

const DEFAULT_SETTINGS: ContentGenerationSettings = {
  platform: "instagram",
  templateType: "promotion",
  topic: "",
  audience: "Женщины 25-45 лет",
  tone: "professional",
  length: "medium",
  service: "",
  seoKeywords: [],
};

const STORAGE_KEY = "content-generation-history";
const SETTINGS_KEY = "content-generation-settings";

function loadSavedItems(): ContentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error(`Failed to read "${STORAGE_KEY}" from localStorage:`, err);
    return [];
  }
}

function loadSettings(): ContentGenerationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      : DEFAULT_SETTINGS;
  } catch (err) {
    console.error(`Failed to read "${SETTINGS_KEY}" from localStorage:`, err);
    return DEFAULT_SETTINGS;
  }
}

function persist(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to write "${key}" to localStorage:`, err);
    return false;
  }
}

export function useContentGenerator(): UseContentGeneratorReturn {
  const [result, setResult] = useState<ContentGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] =
    useState<ContentGenerationSettings>(DEFAULT_SETTINGS);
  const [savedItems, setSavedItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setSettings(loadSettings());
      setSavedItems(loadSavedItems());
    });
  }, []);

  const generate = useCallback(async () => {
    if (!settings.topic.trim()) {
      setError("Укажите тему контента");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: ContentGenerationRequest = {
        platform: settings.platform,
        templateType: settings.templateType,
        topic: settings.topic,
        audience: settings.audience || undefined,
        tone: settings.tone,
        length: settings.length,
        service: settings.service || undefined,
        seoKeywords:
          settings.seoKeywords.length > 0 ? settings.seoKeywords : undefined,
      };

      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Ошибка генерации (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
      persist(SETTINGS_KEY, settings);
    } catch (err) {
      console.error("Content generation failed:", err);
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const regenerate = useCallback(async () => {
    await generate();
  }, [generate]);

  const saveItem = useCallback(
    (item: Omit<ContentItem, "id" | "createdAt">) => {
      const newItem: ContentItem = {
        ...item,
        id: `content-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...savedItems];
      setSavedItems(updated);
      if (!persist(STORAGE_KEY, updated)) {
        setError("Не удалось сохранить контент в браузере");
      }
    },
    [savedItems],
  );

  const deleteItem = useCallback(
    (id: string) => {
      const updated = savedItems.filter((i) => i.id !== id);
      setSavedItems(updated);
      if (!persist(STORAGE_KEY, updated)) {
        setError("Не удалось обновить сохранённый контент в браузере");
      }
    },
    [savedItems],
  );

  return {
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
  };
}
