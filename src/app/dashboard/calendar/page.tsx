"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  appointmentsData,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/mock-data";
import type { AppointmentStatus } from "@/types";

type ViewMode = "week" | "day" | "list";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i);

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; border: string; text: string; dot: string }> = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-800 dark:text-amber-200",
    dot: "bg-amber-400",
  },
  confirmed: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-300 dark:border-green-700",
    text: "text-green-800 dark:text-green-200",
    dot: "bg-green-400",
  },
  cancelled: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-300 dark:border-red-700",
    text: "text-red-800 dark:text-red-200",
    dot: "bg-red-400",
  },
  completed: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-300 dark:border-sky-700",
    text: "text-sky-800 dark:text-sky-200",
    dot: "bg-sky-400",
  },
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(day + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekDays = useMemo(
    () => WEEKDAYS.map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
    [weekStart],
  );

  const filteredAppointments = useMemo(() => {
    let result = appointmentsData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.clientName.toLowerCase().includes(q) || a.service.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }
    return result;
  }, [searchQuery, statusFilter]);

  const handlePrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - (viewMode === "week" ? 7 : 1));
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (viewMode === "week" ? 7 : 1));
    setCurrentDate(d);
  };

  const handleToday = () => setCurrentDate(new Date());

  const getAppointmentsForDay = (date: Date, hour: number) => {
    const dateStr = formatDate(date);
    return appointmentsData.filter(
      (a) =>
        a.date === dateStr &&
        parseTime(a.time) >= hour &&
        parseTime(a.time) < hour + 1 &&
        a.status !== "cancelled",
    );
  };

  const allAppointmentsForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return appointmentsData.filter((a) => a.date === dateStr);
  };

  const dayCounts = weekDays.map((d) => allAppointmentsForDay(d).length);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Календарь записей</h1>
          <p className="text-sm text-muted-foreground">
            {currentDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-40 shrink-0"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "all")}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="confirmed">Подтверждена</option>
            <option value="completed">Завершена</option>
            <option value="cancelled">Отменена</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button
            onClick={handlePrev}
            className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={handleToday}
            className="border-x border-border px-3 text-xs font-medium hover:bg-muted transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={handleNext}
            className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          {(["day", "week", "list"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cx(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === mode ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {{ day: "День", week: "Неделя", list: "Список" }[mode]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {Object.entries(STATUS_COLORS).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-1">
              <span className={cn("size-2 rounded-full", colors.dot)} />
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                {STATUS_LABELS[status as AppointmentStatus]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {viewMode === "list" && (
        <Card>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <EmptyState />
            ) : (
              <AppointmentList appointments={filteredAppointments} />
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === "week" && (
        <div className="overflow-x-auto">
          <div className="min-w-[720px] border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-muted/30 border-b border-border">
              <div className="p-2" />
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  className={cx(
                    "flex flex-col items-center gap-0.5 p-2 border-l border-border/50",
                    formatDate(d) === formatDate(new Date()) && "bg-primary/5",
                  )}
                >
                  <span className="text-[10px] font-medium text-muted-foreground">{WEEKDAYS[i]}</span>
                  <span
                    className={cx(
                      "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      formatDate(d) === formatDate(new Date())
                        ? "bg-primary text-primary-foreground"
                        : "",
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {dayCounts[i]} {dayCounts[i] === 1 ? "запись" : "записей"}
                  </span>
                </div>
              ))}
            </div>

            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/30 last:border-b-0"
              >
                <div className="flex items-start p-2">
                  <span className="text-[10px] text-muted-foreground">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>
                {weekDays.map((d) => {
                  const dayAppts = getAppointmentsForDay(d, hour);
                  return (
                    <div
                      key={`${hour}-${d.getDate()}`}
                      className="min-h-[2.5rem] border-l border-border/30 p-0.5 space-y-0.5"
                    >
                      {dayAppts.map((apt) => {
                        const colors = STATUS_COLORS[apt.status];
                        return (
                          <div
                            key={apt.id}
                            className={cx(
                              "rounded-md border px-1.5 py-0.5 cursor-pointer transition-opacity hover:opacity-80",
                              colors.bg,
                              colors.border,
                            )}
                          >
                            <div className={cx("text-[10px] font-medium truncate", colors.text)}>
                              {apt.time} {apt.clientName.split(" ")[0]}
                            </div>
                            <div className={cx("text-[9px] truncate opacity-75", colors.text)}>
                              {apt.service}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === "day" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{formatDayLabel(currentDate)}</CardTitle>
              <Badge variant="outline">{allAppointmentsForDay(currentDate).length} записей</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DayTimeline date={currentDate} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cx(...args: Array<string | false | undefined>) {
  return cn(...args);
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <CalendarIcon className="size-6 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-medium">Записи не найдены</p>
      <p className="text-xs text-muted-foreground">Измените фильтры или создайте новую запись</p>
    </div>
  );
}

function AppointmentList({ appointments }: { appointments: typeof appointmentsData }) {
  const groupedByDate = appointments.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) acc[apt.date] = [];
      acc[apt.date].push(apt);
      return acc;
    },
    {} as Record<string, typeof appointmentsData>,
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate).map(([date, appts]) => (
        <div key={date}>
          <div className="sticky top-0 z-10 flex items-center gap-2 bg-card py-2">
            <CalendarIcon className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {new Date(date).toLocaleDateString("ru-RU", {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            </span>
            <Badge variant="secondary" className="text-[10px]">{appts.length}</Badge>
          </div>
          <div className="space-y-1.5">
            {appts
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((apt) => {
                const colors = STATUS_COLORS[apt.status];
                return (
                  <div
                    key={apt.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:shadow-sm",
                      colors.bg,
                      colors.border,
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        colors.bg,
                        colors.text,
                      )}
                    >
                      {apt.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{apt.service}</span>
                        <Badge variant="outline" className={cn("text-[10px]", colors.text)}>
                          <span className={cn("size-1.5 rounded-full mr-1", colors.dot)} />
                          {APPOINTMENT_STATUS_LABELS[apt.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{apt.clientName}</span>
                        <span>·</span>
                        <span>{apt.time}–{apt.endTime}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">₽{apt.servicePrice}</span>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DayTimeline({ date }: { date: Date }) {
  const dateStr = formatDate(date);
  const dayAppts = appointmentsData
    .filter((a) => a.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        {HOURS.map((hour) => {
          const hourAppts = dayAppts.filter(
            (a) => parseTime(a.time) >= hour && parseTime(a.time) < hour + 1,
          );
          return (
            <div
              key={hour}
              className="flex gap-3 border-t border-border/30 py-1.5 first:border-t-0"
            >
              <span className="w-12 shrink-0 text-xs text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                {hourAppts.map((apt) => {
                  const colors = STATUS_COLORS[apt.status];
                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-2",
                        colors.bg,
                        colors.border,
                      )}
                    >
                      <Clock className={cn("size-4 shrink-0", colors.text)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", colors.text)}>
                            {apt.service}
                          </span>
                          <span className={cn("text-[10px]", colors.text)}>
                            {apt.time}–{apt.endTime}
                          </span>
                        </div>
                        <div className={cn("text-xs opacity-75", colors.text)}>
                          {apt.clientName} · ₽{apt.servicePrice}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
