"use client";

import { useState } from "react";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  Beaker,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  conversionGoalsData,
  abTestsData,
  CONVERSION_TYPE_LABELS,
  AB_TEST_STATUS_LABELS,
  type ConversionGoalItem,
  type AbTestItem,
} from "@/lib/promotion-mock-data";
import type { ConversionGoalType, AbTestStatus } from "@/types";

const GOAL_ICONS: Record<ConversionGoalType, React.ElementType> = {
  booking: Target,
  registration: Zap,
  visit: Award,
};

const GOAL_COLORS: Record<ConversionGoalType, string> = {
  booking: "bg-primary/10 text-primary",
  registration: "bg-chart-2/20 text-chart-2",
  visit: "bg-sage/20 text-sage",
};

const AB_STATUS_COLORS: Record<AbTestStatus, string> = {
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300",
  running: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export default function ConversionsPage() {
  const [activeTab, setActiveTab] = useState<"goals" | "ab">("goals");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={activeTab === "goals" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("goals")}
        >
          <Target className="size-4" />
          Цели конверсии
        </Button>
        <Button
          variant={activeTab === "ab" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("ab")}
        >
          <Beaker className="size-4" />
          A/B тесты
        </Button>
      </div>

      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {conversionGoalsData.map((goal) => (
              <ConversionGoalCard key={goal.id} goal={goal} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Путь конверсии</CardTitle>
              <CardDescription>
                Запись → Регистрация → Визит
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionGoalsData
                  .sort((a, b) => {
                    const order: Record<ConversionGoalType, number> = { registration: 1, booking: 2, visit: 3 };
                    return order[a.type] - order[b.type];
                  })
                  .map((goal, i) => {
                    const Icon = GOAL_ICONS[goal.type];
                    const color = GOAL_COLORS[goal.type];
                    return (
                      <div key={goal.id} className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn("flex size-10 items-center justify-center rounded-full", color)}>
                            <Icon className="size-5" />
                          </div>
                          {i < conversionGoalsData.length - 1 && (
                            <div className="mt-1 h-8 w-px bg-border" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{goal.name}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {CONVERSION_TYPE_LABELS[goal.type]}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{goal.totalAttempts} попыток</span>
                            <span>{goal.totalCompleted} выполнено</span>
                            <span className={cn(
                              "flex items-center gap-0.5",
                              goal.trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                            )}>
                              {goal.trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                              {Math.abs(goal.trend)}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${goal.conversionRate}%` }}
                            />
                          </div>
                          <div className="mt-1 text-xs font-medium">{goal.conversionRate}% конверсия</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "ab" && (
        <div className="space-y-3">
          {abTestsData.map((test) => (
            <AbTestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConversionGoalCard({ goal }: { goal: ConversionGoalItem }) {
  const Icon = GOAL_ICONS[goal.type];
  const color = GOAL_COLORS[goal.type];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={cn("flex size-10 items-center justify-center rounded-xl", color)}>
            <Icon className="size-5" />
          </div>
          <div className={cn(
            "flex items-center gap-0.5 text-xs",
            goal.trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
          )}>
            {goal.trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(goal.trend)}%
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{goal.conversionRate}%</div>
          <div className="text-xs text-muted-foreground">{goal.name}</div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {goal.totalCompleted} из {goal.totalAttempts}
        </div>
      </CardContent>
    </Card>
  );
}

function AbTestCard({ test }: { test: AbTestItem }) {
  const getWinnerLabel = (variant: string) => {
    const metrics = variant === "A" ? test.variantAMetrics : test.variantBMetrics;
    if (!metrics) return null;
    const openRate = metrics.sent > 0 ? ((metrics.opened / metrics.sent) * 100).toFixed(0) : "0";
    const clickRate = metrics.opened > 0 ? ((metrics.clicked / metrics.opened) * 100).toFixed(0) : "0";
    return { openRate, clickRate };
  };

  const winnerA = getWinnerLabel("A");
  const winnerB = getWinnerLabel("B");

  return (
    <div className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Beaker className="size-5 text-primary" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{test.name}</span>
            <Badge variant="outline" className={cn("shrink-0 text-[10px]", AB_STATUS_COLORS[test.status])}>
              {AB_TEST_STATUS_LABELS[test.status]}
            </Badge>
            {test.winner && (
              <Badge variant="outline" className="shrink-0 border-green-200 text-green-700 dark:border-green-800 dark:text-green-400 text-[10px]">
                Победитель: {test.winner}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{test.campaignName}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={cn(
          "rounded-lg border p-3",
          test.winner === "A" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20" : "border-border/50",
        )}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold">Вариант A</span>
            {test.winner === "A" && <Award className="size-3 text-green-600" />}
          </div>
          <div className="text-sm">&quot;{test.variantASubject}&quot;</div>
          {winnerA && (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Open: {winnerA.openRate}%</span>
              <span>Click: {winnerA.clickRate}%</span>
            </div>
          )}
        </div>

        <div className={cn(
          "rounded-lg border p-3",
          test.winner === "B" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20" : "border-border/50",
        )}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold">Вариант B</span>
            {test.winner === "B" && <Award className="size-3 text-green-600" />}
          </div>
          <div className="text-sm">&quot;{test.variantBSubject}&quot;</div>
          {winnerB && (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Open: {winnerB.openRate}%</span>
              <span>Click: {winnerB.clickRate}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
