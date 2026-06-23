"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  ArrowUpRight,
  Users,
  Target,
  ShoppingCart,
  Download,
  FileText,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  TrendingUpIcon,
  Activity,
  Filter,
  ChevronDown,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  monthlyRevenueData,
  quarterlyData,
  yearlyData,
  servicePopularityData,
  clientSegments,
  generateHeatmapData,
  heatmapDays,
  heatmapHours,
  aiInsights,
  generateForecastData,
  calculateBusinessHealth,
  calculateMetrics,
  comparisonData,
  type DateRange,
  type RevenueDataPoint,
} from "@/lib/analytics-mock-data";
import {
  exportAnalyticsCsv,
  exportAnalyticsPdf,
  exportAnalyticsExcel,
} from "@/lib/analytics-export";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatCurrency(value: number): string {
  if (value >= 1000000) return `₽${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₽${(value / 1000).toFixed(0)}k`;
  return `₽${value.toLocaleString("ru-RU")}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("ru-RU");
}

function BusinessHealthCard() {
  const health = calculateBusinessHealth();
  const scoreColor =
    health.score >= 80
      ? "text-green-600 dark:text-green-400"
      : health.score >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const scoreBg =
    health.score >= 80
      ? "bg-green-100 dark:bg-green-950/40"
      : health.score >= 60
        ? "bg-amber-100 dark:bg-amber-950/40"
        : "bg-red-100 dark:bg-red-950/40";

  const scoreLabel =
    health.score >= 80 ? "Отлично" : health.score >= 60 ? "Хорошо" : "Требует внимания";

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(health.score / 100) * circumference} ${circumference}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-primary" />
          <CardTitle>Здоровье бизнеса</CardTitle>
        </div>
        <CardDescription>Комплексная оценка состояния</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/50"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                transform="rotate(-90 60 60)"
                className={cn(
                  health.score >= 80
                    ? "text-green-500"
                    : health.score >= 60
                      ? "text-amber-500"
                      : "text-red-500",
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl font-bold", scoreColor)}>{health.score}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Удержание клиентов</span>
            <span className="font-medium">{health.clientRetention}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Загрузка</span>
            <span className="font-medium">{health.utilization}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Средний чек</span>
            <span className="font-medium">₽{formatNumber(health.avgCheck)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Рост новых клиентов</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +{health.newClientsGrowth}%
            </span>
          </div>
        </div>
        <div className={cn("mt-3 rounded-lg p-2 text-center text-xs font-medium", scoreBg, scoreColor)}>
          {scoreLabel}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightTypeBadge({ type }: { type: string }) {
  const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
    positive: { icon: TrendingUpIcon, className: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400", label: "Рост" },
    warning: { icon: AlertTriangle, className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", label: "Внимание" },
    suggestion: { icon: Lightbulb, className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", label: "Совет" },
    trend: { icon: Sparkles, className: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400", label: "Тренд" },
  };

  const c = config[type] || config.suggestion;
  const Icon = c.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px]", c.className)}>
      <Icon className="size-3" />
      {c.label}
    </Badge>
  );
}

function AIInsightsPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle>AI-рекомендации</CardTitle>
          </div>
          <Badge variant="secondary">{aiInsights.length} инсайтов</Badge>
        </div>
        <CardDescription>Автоматический анализ данных и бизнес-советы</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {aiInsights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{insight.title}</span>
                  <InsightTypeBadge type={insight.type} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  insight.impact === "high"
                    ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
                    : insight.impact === "medium"
                      ? "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                      : "border-border text-muted-foreground",
                )}
              >
                {insight.impact === "high" ? "Высокий" : insight.impact === "medium" ? "Средний" : "Низкий"} приоритет
              </Badge>
              <Button variant="ghost" size="xs">
                {insight.actionLabel}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HeatmapChart() {
  const data = useMemo(() => generateHeatmapData(), []);
  const maxVal = Math.max(...data.map((d) => d.value));

  function getColor(value: number): string {
    const ratio = value / maxVal;
    if (ratio < 0.2) return "bg-muted/30";
    if (ratio < 0.4) return "bg-primary/20";
    if (ratio < 0.6) return "bg-primary/40";
    if (ratio < 0.8) return "bg-primary/60";
    return "bg-primary/90";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Загрузка по дням и часам</CardTitle>
            <CardDescription>Heatmap загруженности расписания</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Меньше</span>
            {["bg-muted/30", "bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/90"].map((c, i) => (
              <div key={i} className={cn("size-3 rounded-sm", c)} />
            ))}
            <span className="text-[10px] text-muted-foreground">Больше</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            <div className="flex">
              <div className="w-8 shrink-0" />
              {heatmapHours.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {h}
                </div>
              ))}
            </div>
            {heatmapDays.map((day, dayIdx) => (
              <div key={day} className="flex items-center">
                <div className="w-8 shrink-0 text-[10px] text-muted-foreground">{day}</div>
                {heatmapHours.map((hour) => {
                  const cell = data.find((d) => d.day === dayIdx && d.hour === hour);
                  return (
                    <div
                      key={hour}
                      className="m-0.5 flex-1"
                      title={`${day} ${hour}:00 — ${cell?.value || 0} записей`}
                    >
                      <div
                        className={cn(
                          "h-6 rounded-sm transition-colors",
                          getColor(cell?.value || 0),
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastChart() {
  const data = useMemo(() => generateForecastData(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогноз дохода</CardTitle>
        <CardDescription>Прогноз на основе текущих трендов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis fontSize={11} tick={{ fill: "var(--muted-foreground)" }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                formatter={(value) => [typeof value === "number" ? formatCurrency(value) : "—"]}
                contentStyle={{
                  backdropFilter: "blur(8px)",
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#forecastGradient)"
                name="Факт"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#confidenceGradient)"
                name="Прогноз"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#forecastGradient)"
                name="Факт"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#confidenceGradient)"
                name="Прогноз"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 bg-chart-1" />
            <span className="text-[10px] text-muted-foreground">Факт</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 border-t border-dashed border-chart-2" />
            <span className="text-[10px] text-muted-foreground">Прогноз</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonSection({ range }: { range: DateRange }) {
  const data = comparisonData[range];
  const revenueChange = ((data.current.revenue - data.previous.revenue) / data.previous.revenue) * 100;
  const appointmentsChange = ((data.current.appointments - data.previous.appointments) / data.previous.appointments) * 100;
  const clientsChange = ((data.current.newClients - data.previous.newClients) / data.previous.newClients) * 100;

  const rangeLabels: Record<DateRange, { current: string; previous: string }> = {
    month: { current: "Этот месяц", previous: "Прошлый месяц" },
    quarter: { current: "Этот квартал", previous: "Прошлый квартал" },
    year: { current: "Этот год", previous: "Прошлый год" },
  };

  const comparisonChartData = [
    { label: "Доход", current: data.current.revenue, previous: data.previous.revenue },
    { label: "Записи", current: data.current.appointments * 3500, previous: data.previous.appointments * 3500 },
    { label: "Клиенты", current: data.current.newClients * 10000, previous: data.previous.newClients * 10000 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сравнение: {rangeLabels[range].current} vs {rangeLabels[range].previous}</CardTitle>
        <CardDescription>Динамика ключевых показателей</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Доход", change: revenueChange, current: data.current.revenue, previous: data.previous.revenue, fmt: formatCurrency },
            { label: "Записи", change: appointmentsChange, current: data.current.appointments, previous: data.previous.appointments, fmt: (v: number) => String(v) },
            { label: "Новые клиенты", change: clientsChange, current: data.current.newClients, previous: data.previous.newClients, fmt: (v: number) => String(v) },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border/50 p-3">
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="mt-1 text-lg font-bold">{m.fmt(m.current)}</div>
              <div className={cn("flex items-center gap-1 text-xs", m.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {m.change >= 0 ? <ArrowUpRight className="size-3" /> : <TrendingDown className="size-3" />}
                {m.change >= 0 ? "+" : ""}{m.change.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" fontSize={11} tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis fontSize={11} tick={{ fill: "var(--muted-foreground)" }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backdropFilter: "blur(8px)",
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend fontSize={11} />
              <Bar dataKey="previous" name={rangeLabels[range].previous} fill="var(--chart-3)" radius={[4, 4, 0, 0]} opacity={0.5} />
              <Bar dataKey="current" name={rangeLabels[range].current} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ServicePopularityChart() {
  const data = servicePopularityData.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Популярность услуг</CardTitle>
        <CardDescription>Количество записей по услугам</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: "var(--muted-foreground)" }} width={120} />
              <Tooltip
                contentStyle={{
                  backdropFilter: "blur(8px)",
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [
                  name === "count" ? `${value} записей` : formatCurrency(Number(value)),
                  name === "count" ? "Записи" : "Доход",
                ]}
              />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} name="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientSegmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Сегменты клиентов</CardTitle>
        <CardDescription>Распределение по категориям</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientSegments}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {clientSegments.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backdropFilter: "blur(8px)",
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {clientSegments.map((seg, idx) => (
              <div key={seg.segment} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-sm shrink-0"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <div className="flex-1 flex items-center justify-between text-xs">
                  <span>{seg.segment}</span>
                  <span className="text-muted-foreground">{seg.count} чел.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {clientSegments.map((seg) => (
            <div key={seg.segment} className="rounded-lg border border-border/50 p-2">
              <div className="text-[10px] text-muted-foreground">{seg.segment}</div>
              <div className="text-sm font-bold">{formatCurrency(seg.revenue)}</div>
              <div className="text-[10px] text-muted-foreground">Ср. визитов: {seg.avgVisits}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ExportPanel() {
  const revenue = monthlyRevenueData;
  const services = servicePopularityData;
  const metrics = calculateMetrics();
  const health = calculateBusinessHealth();
  const insights = aiInsights;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="size-4 text-primary" />
          <CardTitle>Экспорт отчётов</CardTitle>
        </div>
        <CardDescription>Скачать аналитический отчёт</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => exportAnalyticsCsv(revenue, services, metrics)}
        >
          <FileText className="size-4" />
          Экспорт в CSV
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => exportAnalyticsExcel(revenue, services, metrics)}
        >
          <FileText className="size-4" />
          Экспорт в Excel
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => exportAnalyticsPdf(revenue, services, metrics, health, insights)}
        >
          <Download className="size-4" />
          Печать / PDF
        </Button>
      </CardContent>
    </Card>
  );
}

function MetricsCards() {
  const metrics = calculateMetrics();

  const cards = [
    {
      label: "LTV клиента",
      value: `₽${formatNumber(metrics.ltv)}`,
      change: metrics.clientGrowth,
      icon: Users,
      description: "Средний доход с клиента за всё время",
    },
    {
      label: "Средний чек",
      value: `₽${formatNumber(metrics.avgCheck)}`,
      change: 5.2,
      icon: ShoppingCart,
      description: "Средняя стоимость одного визита",
    },
    {
      label: "Конверсия",
      value: `${metrics.conversionRate}%`,
      change: 3.1,
      icon: Target,
      description: "Новые → повторные визиты",
    },
    {
      label: "Retention rate",
      value: `${metrics.retentionRate}%`,
      change: 2.4,
      icon: Activity,
      description: "Доля возвращающихся клиентов",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((m, i) => (
        <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <m.icon className="size-5 text-primary" />
              </div>
              <div className={cn("flex items-center gap-1 text-xs", m.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {m.change >= 0 ? <ArrowUpRight className="size-3" /> : <TrendingDown className="size-3" />}
                {m.change >= 0 ? "+" : ""}{m.change}%
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{m.value}</div>
              <div className="text-xs font-medium">{m.label}</div>
              <div className="text-[10px] text-muted-foreground">{m.description}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RevenueChart({ dateRange }: { dateRange: DateRange }) {
  const data: RevenueDataPoint[] =
    dateRange === "month"
      ? monthlyRevenueData
      : dateRange === "quarter"
        ? quarterlyData
        : yearlyData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Динамика доходов, записей и клиентов</CardTitle>
            <CardDescription>
              {dateRange === "month"
                ? "Помесячная динамика"
                : dateRange === "quarter"
                  ? "Поквартальная динамика"
                  : "Годовая динамика"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" fontSize={11} tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis
                yAxisId="left"
                fontSize={11}
                tick={{ fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <YAxis yAxisId="right" orientation="right" fontSize={11} tick={{ fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backdropFilter: "blur(8px)",
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, name) => {
                  if (name === "revenue") return [formatCurrency(Number(value)), "Доход"];
                  return [value, name === "appointments" ? "Записи" : "Новые клиенты"];
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "revenue" ? "Доход" : value === "appointments" ? "Записи" : "Новые клиенты"
                }
                fontSize={11}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="appointments"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="newClients"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={{ r: 2 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const rangeOptions: { value: DateRange; label: string }[] = [
    { value: "month", label: "Месяц" },
    { value: "quarter", label: "Квартал" },
    { value: "year", label: "Год" },
  ];

  const serviceCategories = ["all", "Инъекции", "Пилинги", "Филлеры", "Уход", "Лазер"];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Аналитика</h1>
          <p className="text-sm text-muted-foreground">
            Полный анализ бизнеса с AI-инсайтами
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="size-4" />
            Фильтры
            <ChevronDown className={cn("size-3 transition-transform", showFilters && "rotate-180")} />
          </Button>
          <div className="flex rounded-lg border border-border">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg",
                  dateRange === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
                onClick={() => setDateRange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 animate-fade-in rounded-xl border border-border/50 bg-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Период</label>
              <div className="mt-1 flex gap-1">
                {rangeOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={dateRange === opt.value ? "default" : "outline"}
                    size="xs"
                    onClick={() => setDateRange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Категория услуг</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {serviceCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={serviceFilter === cat ? "default" : "outline"}
                    size="xs"
                    onClick={() => setServiceFilter(cat)}
                  >
                    {cat === "all" ? "Все" : cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <MetricsCards />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart dateRange={dateRange} />
        </div>
        <BusinessHealthCard />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ServicePopularityChart />
        <ClientSegmentChart />
      </div>

      <div className="mt-6">
        <ComparisonSection range={dateRange} />
      </div>

      <div className="mt-6">
        <HeatmapChart />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ForecastChart />
        <AIInsightsPanel />
      </div>

      <div className="mt-6">
        <ExportPanel />
      </div>
    </div>
  );
}
