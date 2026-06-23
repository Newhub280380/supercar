"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Settings2, Sparkles, Droplets, X } from "lucide-react";
import type { SkinType } from "@/types";

interface ChatSettingsProps {
  tone: "professional" | "friendly";
  skinType: SkinType | null;
  concerns: string[];
  onToneChange: (tone: "professional" | "friendly") => void;
  onSkinTypeChange: (skinType: SkinType | null) => void;
  onConcernsChange: (concerns: string[]) => void;
  onClose: () => void;
}

const SKIN_TYPES: { value: SkinType; label: string; icon: string }[] = [
  { value: "normal", label: "Нормальная", icon: "✨" },
  { value: "dry", label: "Сухая", icon: "🏜️" },
  { value: "oily", label: "Жирная", icon: "💧" },
  { value: "combination", label: "Комбинированная", icon: "🔀" },
  { value: "sensitive", label: "Чувствительная", icon: "🌹" },
];

const CONCERNS = [
  "Морщины",
  "Акне",
  "Пигментация",
  "Сухость",
  "Жирность",
  "Расширенные поры",
  "Тусклый цвет",
  "Купероз",
  "Рубцы",
  "Птоз",
];

export const ChatSettings = memo(function ChatSettings({
  tone,
  skinType,
  concerns,
  onToneChange,
  onSkinTypeChange,
  onConcernsChange,
  onClose,
}: ChatSettingsProps) {
  const toggleConcern = (c: string) => {
    onConcernsChange(
      concerns.includes(c) ? concerns.filter((x) => x !== c) : [...concerns, c],
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-muted-foreground" />
          <h3 className="font-heading text-sm font-semibold">Настройки</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-5 px-4 pb-4">
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3" />
            Стиль общения
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onToneChange("professional")}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                tone === "professional"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              Профессиональный
            </button>
            <button
              type="button"
              onClick={() => onToneChange("friendly")}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                tone === "friendly"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              Дружелюбный
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Droplets className="size-3" />
            Тип кожи
          </label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSkinTypeChange(null)}
              className={cn(
                "w-full rounded-lg border px-3 py-1.5 text-left text-xs transition-all",
                skinType === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/50",
              )}
            >
              Не выбрано
            </button>
            {SKIN_TYPES.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => onSkinTypeChange(st.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition-all",
                  skinType === st.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted/50",
                )}
              >
                <span>{st.icon}</span>
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 text-xs font-medium text-muted-foreground">
            Проблемы кожи
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CONCERNS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleConcern(c)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs transition-all",
                  concerns.includes(c)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
