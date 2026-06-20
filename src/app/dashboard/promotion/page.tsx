"use client";

import {
  Mail,
  MessageSquare,
  Link2,
  Target,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  promotionOverviewMetrics,
  emailOpenRateData,
  conversionFunnelData,
} from "@/lib/promotion-mock-data";

const METRIC_ICONS: Record<string, React.ElementType> = {
  mail: Mail,
  messageSquare: MessageSquare,
  link: Link2,
  target: Target,
};

function getMaxValue(data: Array<{ value: number }>) {
  return Math.max(...data.map((d) => d.value));
}

export default function PromotionOverviewPage() {
  const maxOpenRate = getMaxValue(emailOpenRateData);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {promotionOverviewMetrics.map((metric, i) => {
          const Icon = METRIC_ICONS[metric.icon] || Mail;
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Воронка конверсии</CardTitle>
            <CardDescription>Посетители → Регистрация → Запись → Визит</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionFunnelData.map((stage, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">
                      {stage.count.toLocaleString("ru-RU")} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Rate Email-рассылок</CardTitle>
            <CardDescription>Динамика за полгода</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {emailOpenRateData.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{d.value}%</span>
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition-all duration-500 hover:bg-primary"
                    style={{
                      height: `${(d.value / maxOpenRate) * 100}%`,
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

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link
              href="/dashboard/promotion/seo"
              className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">SEO</div>
                <div className="text-xs text-muted-foreground">Мета-теги, sitemap</div>
              </div>
            </Link>
            <Link
              href="/dashboard/promotion/emails"
              className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-chart-2/20">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-xs text-muted-foreground">Рассылки, шаблоны</div>
              </div>
            </Link>
            <Link
              href="/dashboard/promotion/sms"
              className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-sage/20">
                <TrendingUp className="size-5 text-sage" />
              </div>
              <div>
                <div className="text-sm font-medium">SMS</div>
                <div className="text-xs text-muted-foreground">Уведомления</div>
              </div>
            </Link>
            <Link
              href="/dashboard/promotion/conversions"
              className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-chart-3/20">
                <Target className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Конверсии</div>
                <div className="text-xs text-muted-foreground">Цели, A/B тесты</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
