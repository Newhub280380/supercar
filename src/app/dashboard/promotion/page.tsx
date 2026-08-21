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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  promotionOverviewMetrics,
  emailOpenRateData,
  conversionFunnelData,
} from "@/lib/promotion-mock-data";
import { formatNumber } from "@/lib/format";

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
            <Card
              key={i}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                    <Icon className="text-primary size-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <ArrowUpRight className="size-3" />
                    {metric.change}%
                  </div>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Воронка конверсии</CardTitle>
            <CardDescription>
              Посетители → Регистрация → Запись → Визит
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionFunnelData.map((stage, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(stage.count)} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="bg-muted h-3 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
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
            <div className="flex h-40 items-end gap-3">
              {emailOpenRateData.map((d, i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-muted-foreground text-xs">
                    {d.value}%
                  </span>
                  <div
                    className="bg-primary/80 hover:bg-primary w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${(d.value / maxOpenRate) * 100}%`,
                      minHeight: "8px",
                    }}
                  />
                  <span className="text-muted-foreground text-[10px]">
                    {d.label}
                  </span>
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
                  Рассылки, шаблоны
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
                <div className="text-muted-foreground text-xs">Уведомления</div>
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
