"use client";

import {
  Calendar,
  UserPlus,
  TrendingUp,
  Star,
  ArrowUpRight,
  Clock,
  Bell,
  Plus,
  ChevronRight,
  Cake,
  Sparkles,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  dashboardMetrics,
  weeklyChartData,
  revenueChartData,
  appointmentsData,
  remindersData,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/mock-data";
import { exportAppointmentsCsv } from "@/lib/csv-export";
import type { AppointmentStatus } from "@/types";

const METRIC_ICONS: Record<string, React.ElementType> = {
  calendar: Calendar,
  userPlus: UserPlus,
  trendingUp: TrendingUp,
  star: Star,
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  completed: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
};

const REMINDER_ICONS: Record<string, React.ElementType> = {
  upcoming: Clock,
  followup: Bell,
  birthday: Cake,
};

function getMaxValue(data: Array<{ value: number }>) {
  return Math.max(...data.map((d) => d.value));
}

export default function DashboardPage() {
  const todayAppointments = appointmentsData.filter(
    (a) => a.date === new Date().toISOString().split("T")[0],
  );

  const maxWeekly = getMaxValue(weeklyChartData);
  const maxRevenue = getMaxValue(revenueChartData);

  const handleExport = () => {
    const exportData = todayAppointments.map((a) => ({
      "Клиент": a.clientName,
      "Услуга": a.service,
      "Время": `${a.time} - ${a.endTime}`,
      "Статус": APPOINTMENT_STATUS_LABELS[a.status],
      "Стоимость": a.servicePrice,
      "Заметки": a.notes || "",
    }));
    exportAppointmentsCsv(exportData, "appointments-today");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Добро пожаловать!</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="size-4" />
            Экспорт
          </Button>
          <Link href="/dashboard/calendar">
            <Button size="sm">
              <Plus className="size-4" />
              Новая запись
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric, i) => {
          const Icon = METRIC_ICONS[metric.icon] || Calendar;
          return (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <ArrowUpRight className="size-3" />
                    {metric.change}%
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Записи за неделю</CardTitle>
                <CardDescription>Распределение по дням</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {weeklyChartData.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{d.value}</span>
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition-all duration-500 hover:bg-primary"
                    style={{
                      height: `${(d.value / maxWeekly) * 100}%`,
                      minHeight: "8px",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Напоминания</CardTitle>
            <CardDescription>Ближайшие события</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {remindersData.slice(0, 4).map((r) => {
              const Icon = REMINDER_ICONS[r.type] || Bell;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-2.5"
                >
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      r.type === "birthday"
                        ? "bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
                        : r.type === "followup"
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-sm font-medium">{r.clientName}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {r.service} {r.time && `· ${r.time}`}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Сегодняшние записи</CardTitle>
                <CardDescription>{todayAppointments.length} записей запланировано</CardDescription>
              </div>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" size="sm">
                  Все
                  <ChevronRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {apt.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{apt.service}</span>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", STATUS_COLORS[apt.status])}
                      >
                        {APPOINTMENT_STATUS_LABELS[apt.status]}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {apt.clientName} · {apt.time}–{apt.endTime}
                    </div>
                  </div>
                  <span className="text-sm font-medium">₽{apt.servicePrice}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Доход по месяцам</CardTitle>
            <CardDescription>Динамика за полгода</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {revenueChartData.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(d.value / 1000)}k
                  </span>
                  <div
                    className="w-full rounded-t-md bg-chart-2/80 transition-all duration-500 hover:bg-chart-2"
                    style={{
                      height: `${(d.value / maxRevenue) * 100}%`,
                      minHeight: "8px",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Link
                href="/dashboard/calendar"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="size-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Записаться</div>
                  <div className="text-xs text-muted-foreground">Новая запись клиента</div>
                </div>
              </Link>
              <Link
                href="/dashboard/clients"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-sage/20">
                  <UserPlus className="size-5 text-sage" />
                </div>
                <div>
                  <div className="text-sm font-medium">Добавить клиента</div>
                  <div className="text-xs text-muted-foreground">Новый профиль</div>
                </div>
              </Link>
              <Link
                href="/dashboard/services"
                className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-chart-2/20">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Услуги</div>
                  <div className="text-xs text-muted-foreground">Управление прайсом</div>
                </div>
              </Link>
              <button
                onClick={handleExport}
                className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm text-left"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-chart-3/20">
                  <FileDown className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Экспорт</div>
                  <div className="text-xs text-muted-foreground">CSV / Excel</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
