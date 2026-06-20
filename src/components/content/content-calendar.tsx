"use client";

import { Calendar as CalendarIcon, Camera, Send, Hash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentPlatform, ContentTemplateType } from "@/types";
import { useState, useMemo } from "react";

interface CalendarEntry {
  id: string;
  title: string;
  platform: ContentPlatform;
  templateType: ContentTemplateType;
  date: string;
  status: "draft" | "scheduled" | "published";
}

const platformIcons: Record<ContentPlatform, typeof Camera> = {
  instagram: Camera,
  telegram: Send,
  vk: Hash,
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  published: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
};

const statusLabels = {
  draft: "Черновик",
  scheduled: "Запланировано",
  published: "Опубликовано",
};

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  for (let i = -startOffset; i <= lastDay.getDate() - 1 + (6 - ((lastDay.getDay() + 6) % 7)); i++) {
    if (i < 0) {
      days.push(new Date(year, month, i + 1));
    } else if (i >= lastDay.getDate()) {
      days.push(new Date(year, month, i + 1));
    } else {
      days.push(new Date(year, month, i + 1));
    }
  }
  return days;
}

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const DAY_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function ContentCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [entries] = useState<CalendarEntry[]>([
    {
      id: "cal-1",
      title: "Акция на биоревитализацию",
      platform: "instagram",
      templateType: "promotion",
      date: new Date(currentYear, currentMonth, Math.min(today.getDate() + 2, 28)).toISOString().split("T")[0],
      status: "scheduled",
    },
    {
      id: "cal-2",
      title: "Советы по зимнему уходу",
      platform: "telegram",
      templateType: "care_tips",
      date: new Date(currentYear, currentMonth, Math.min(today.getDate() + 5, 28)).toISOString().split("T")[0],
      status: "draft",
    },
    {
      id: "cal-3",
      title: "Кейс: омоложение после 40",
      platform: "vk",
      templateType: "review",
      date: new Date(currentYear, currentMonth, Math.min(today.getDate() + 8, 28)).toISOString().split("T")[0],
      status: "published",
    },
  ]);

  const days = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const existing = map.get(entry.date) ?? [];
      existing.push(entry);
      map.set(entry.date, existing);
    }
    return map;
  }, [entries]);

  const goToPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isCurrentMonth = (d: Date) => d.getMonth() === currentMonth;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <CalendarIcon className="size-4 text-primary" />
            Календарь контента
          </CardTitle>
          <Button variant="outline" size="xs" className="gap-1">
            <Plus className="size-3" /> Планировать
          </Button>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="icon-sm" onClick={goToPrev}>
            &larr;
          </Button>
          <span className="text-sm font-medium">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={goToNext}>
            &rarr;
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px rounded-lg border border-border/50 overflow-hidden">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="bg-muted/50 py-1.5 text-center text-[10px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const dateStr = day.toISOString().split("T")[0];
            const dayEntries = entriesByDate.get(dateStr) ?? [];
            const current = isToday(day);

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[72px] border-t border-border/30 p-1",
                  !isCurrentMonth(day) && "opacity-40",
                  current && "bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "mb-0.5 inline-flex size-5 items-center justify-center rounded-full text-[10px]",
                    current ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {day.getDate()}
                </span>
                {dayEntries.map((entry) => {
                  const Icon = platformIcons[entry.platform];
                  return (
                    <div
                      key={entry.id}
                      className="mt-0.5 flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] truncate"
                      title={entry.title}
                    >
                      <Icon className="size-2.5 shrink-0" />
                      <span className="truncate">{entry.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {(Object.entries(statusLabels) as [keyof typeof statusLabels, string][]).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", statusStyles[key].split(" ")[0])} />
              {label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
