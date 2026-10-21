"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Users, Target, ShoppingCart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { downloadCsv, csvRow } from "@/lib/csv";
import { formatNumber } from "@/lib/format";

interface HouseMetrics {
  clients: { total: number; newThisMonth: number };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    overdue: number;
  };
  revenue: { thisMonth: number; prevMonth: number; avgTicket: number };
  services: { total: number; active: number };
  marketing: {
    emailCampaigns: number;
    smsCampaigns: number;
    utmCampaigns: number;
    subscribers: number;
  };
  contacts: { total: number };
  leads: {
    total: number;
    new: number;
    byStatus: Record<string, number>;
  };
  week: Array<{ label: string; value: number }>;
  revenueMonths: Array<{ label: string; value: number }>;
}

const LEAD_LABELS: Record<string, string> = {
  new: "Новые",
  in_progress: "В работе",
  qualified: "Квалифицированы",
  won: "Продажа",
  lost: "Потеряны",
};

const tenge = (value: number) => `${formatNumber(value)} ₸`;

const EMPTY: HouseMetrics = {
  clients: { total: 0, newThisMonth: 0 },
  appointments: {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0,
    overdue: 0,
  },
  revenue: { thisMonth: 0, prevMonth: 0, avgTicket: 0 },
  services: { total: 0, active: 0 },
  marketing: {
    emailCampaigns: 0,
    smsCampaigns: 0,
    utmCampaigns: 0,
    subscribers: 0,
  },
  contacts: { total: 0 },
  leads: { total: 0, new: 0, byStatus: {} },
  week: [],
  revenueMonths: [],
};

function exportSnapshot(metrics: HouseMetrics) {
  const lines = [
    "Показатель,Значение",
    csvRow(["Контакты", metrics.contacts.total]),
    csvRow(["Лиды", metrics.leads.total]),
    csvRow(["Новые лиды", metrics.leads.new]),
    csvRow(["Клиенты", metrics.clients.total]),
    csvRow(["Новые клиенты за месяц", metrics.clients.newThisMonth]),
    csvRow(["Приход за месяц, ₸", metrics.revenue.thisMonth]),
    csvRow(["Приход за прошлый месяц, ₸", metrics.revenue.prevMonth]),
    csvRow(["Средний чек, ₸", metrics.revenue.avgTicket]),
    csvRow(["Записей всего", metrics.appointments.total]),
    csvRow(["Проведено", metrics.appointments.completed]),
    "",
    "Месяц,Приход ₸",
    ...metrics.revenueMonths.map((row) => csvRow([row.label, row.value])),
    "",
    "День,Записи",
    ...metrics.week.map((row) => csvRow([row.label, row.value])),
  ];
  downloadCsv(lines.join("\n"), "analytics-live");
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<HouseMetrics>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/house/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HouseMetrics | null) => {
        if (cancelled) return;
        if (!data) {
          setError("Не удалось загрузить показатели из базы");
          return;
        }
        setMetrics(data);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить показатели из базы");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const growth = metrics.revenue.prevMonth
    ? Math.round(
        (metrics.revenue.thisMonth / metrics.revenue.prevMonth) * 100 - 100,
      )
    : null;

  const cards = [
    {
      label: "Контакты клиник",
      value: formatNumber(metrics.contacts.total),
      hint: "книга врачей и клиник",
      icon: Users,
    },
    {
      label: "Лиды",
      value: formatNumber(metrics.leads.total),
      hint: `${formatNumber(metrics.leads.new)} новых`,
      icon: Target,
    },
    {
      label: "Приход за месяц",
      value: tenge(metrics.revenue.thisMonth),
      hint:
        growth === null
          ? "прошлого месяца ещё нет"
          : `${growth >= 0 ? "+" : ""}${growth}% к прошлому месяцу`,
      icon: ShoppingCart,
    },
    {
      label: "Средний чек",
      value: tenge(metrics.revenue.avgTicket),
      hint: `${formatNumber(metrics.appointments.completed)} проведённых визитов`,
      icon: Activity,
    },
  ];

  const leadBars = Object.entries(LEAD_LABELS).map(([key, label]) => ({
    label,
    value: metrics.leads.byStatus?.[key] ?? 0,
  }));

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Аналитика</h1>
          <p className="text-muted-foreground text-sm">
            Цифры из базы: контакты, лиды, записи и завершённые визиты.
            {error ? ` ${error}` : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportSnapshot(metrics)}>
          <Download className="size-4" />
          Экспорт CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <card.icon className="text-primary size-5" />
              </div>
              <div className="mt-3 text-2xl font-bold">{card.value}</div>
              <div className="text-xs font-medium">{card.label}</div>
              <div className="text-muted-foreground text-[10px]">{card.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Приход по месяцам</CardTitle>
            <CardDescription>
              Сумма прайса завершённых записей, тенге
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.revenueMonths}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    fontSize={11}
                    tick={{ fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    fontSize={11}
                    tick={{ fill: "var(--muted-foreground)" }}
                    tickFormatter={(value) => formatNumber(Number(value))}
                  />
                  <Tooltip
                    formatter={(value) => [tenge(Number(value)), "Приход"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Записи за 7 дней</CardTitle>
            <CardDescription>Без отменённых</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.week}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    fontSize={11}
                    tick={{ fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    fontSize={11}
                    tick={{ fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip formatter={(value) => [value, "Записи"]} />
                  <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Лиды по статусам</CardTitle>
          <CardDescription>
            Входящие обращения. Пустые столбцы — таких лидов в базе нет.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  fontSize={11}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  allowDecimals={false}
                  fontSize={11}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <Tooltip formatter={(value) => [value, "Лиды"]} />
                <Bar dataKey="value" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
