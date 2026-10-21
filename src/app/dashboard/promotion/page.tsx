"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Link2, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

interface PromoMetrics {
  marketing: {
    emailCampaigns: number;
    smsCampaigns: number;
    utmCampaigns: number;
    subscribers: number;
  };
  leads: {
    total: number;
    new: number;
    byStatus?: Record<string, number>;
  };
  contacts: { total: number };
}

const EMPTY: PromoMetrics = {
  marketing: {
    emailCampaigns: 0,
    smsCampaigns: 0,
    utmCampaigns: 0,
    subscribers: 0,
  },
  leads: { total: 0, new: 0, byStatus: {} },
  contacts: { total: 0 },
};

const LEAD_LABELS: Array<[string, string]> = [
  ["new", "Новые"],
  ["in_progress", "В работе"],
  ["qualified", "Квалифицированы"],
  ["won", "Продажа"],
  ["lost", "Потеряны"],
];

export default function PromotionOverviewPage() {
  const [metrics, setMetrics] = useState<PromoMetrics>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/house/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PromoMetrics | null) => {
        if (cancelled) return;
        if (!data?.marketing) {
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

  const cards = [
    {
      label: "Email-черновики",
      value: formatNumber(metrics.marketing.emailCampaigns),
      icon: Mail,
    },
    {
      label: "SMS-черновики",
      value: formatNumber(metrics.marketing.smsCampaigns),
      icon: MessageSquare,
    },
    {
      label: "UTM-кампании",
      value: formatNumber(metrics.marketing.utmCampaigns),
      icon: Link2,
    },
    {
      label: "Подписчики",
      value: formatNumber(metrics.marketing.subscribers),
      icon: Target,
    },
  ];

  const funnel = LEAD_LABELS.map(([key, stage]) => ({
    stage,
    count: metrics.leads.byStatus?.[key] ?? 0,
  }));
  const funnelMax = Math.max(1, ...funnel.map((stage) => stage.count));

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Счётчики из базы. Письма и SMS сохраняются черновиками: без
        SENDGRID_API_KEY или MAILGUN_API_KEY и MAILGUN_DOMAIN отправка не
        выполняется и open rate не считается.
        {error ? ` ${error}` : ""}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                  <Icon className="text-primary size-5" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-muted-foreground text-xs">
                    {metric.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Лиды по статусам</CardTitle>
          <CardDescription>
            {formatNumber(metrics.leads.total)} всего, из них{" "}
            {formatNumber(metrics.leads.new)} новых. Контактов клиник:{" "}
            {formatNumber(metrics.contacts.total)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnel.map((stage) => (
              <div key={stage.stage}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(stage.count)}
                  </span>
                </div>
                <div className="bg-muted h-3 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${(stage.count / funnelMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link
              href="/dashboard/promotion/seo"
              className="border-border/50 hover:bg-muted/30 flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
            >
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <Mail className="text-primary size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">SEO</div>
                <div className="text-muted-foreground text-xs">
                  Мета-теги, sitemap
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/promotion/emails"
              className="border-border/50 hover:bg-muted/30 flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
            >
              <div className="bg-chart-2/20 flex size-10 items-center justify-center rounded-xl">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-muted-foreground text-xs">
                  Черновики рассылок
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/promotion/sms"
              className="border-border/50 hover:bg-muted/30 flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
            >
              <div className="bg-sage/20 flex size-10 items-center justify-center rounded-xl">
                <TrendingUp className="text-sage size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">SMS</div>
                <div className="text-muted-foreground text-xs">Черновики</div>
              </div>
            </Link>
            <Link
              href="/dashboard/promotion/conversions"
              className="border-border/50 hover:bg-muted/30 flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm"
            >
              <div className="bg-chart-3/20 flex size-10 items-center justify-center rounded-xl">
                <Target className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Конверсии</div>
                <div className="text-muted-foreground text-xs">
                  Цели, A/B тесты
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
