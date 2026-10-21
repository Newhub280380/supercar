import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { abTests, conversionGoals } from "@/db/schema";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";
import { toLocalIsoDate } from "@/lib/format";

export const GET = withRole(
  "List conversions error",
  MANAGER_ROLES,
  async (session) => {
    const [goals, tests] = await Promise.all([
      db
        .select()
        .from(conversionGoals)
        .where(eq(conversionGoals.userId, session.sub))
        .orderBy(desc(conversionGoals.createdAt)),
      db
        .select()
        .from(abTests)
        .where(eq(abTests.userId, session.sub))
        .orderBy(desc(abTests.createdAt)),
    ]);

    return NextResponse.json({
      goals: goals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        type: goal.type,
        totalAttempts: goal.totalAttempts,
        totalCompleted: goal.totalCompleted,
        conversionRate: Number(goal.conversionRate),
        trend: 0,
        createdAt: toLocalIsoDate(goal.createdAt),
      })),
      abTests: tests.map((test) => ({
        id: test.id,
        name: test.name,
        campaignName: test.campaignId ?? "—",
        variantASubject: test.variantASubject,
        variantBSubject: test.variantBSubject,
        status: test.status,
        variantAMetrics: test.variantAMetrics
          ? {
              sent: test.variantAMetrics.sent ?? 0,
              opened: test.variantAMetrics.opened ?? 0,
              clicked: test.variantAMetrics.clicked ?? 0,
            }
          : null,
        variantBMetrics: test.variantBMetrics
          ? {
              sent: test.variantBMetrics.sent ?? 0,
              opened: test.variantBMetrics.opened ?? 0,
              clicked: test.variantBMetrics.clicked ?? 0,
            }
          : null,
        winner: test.winner,
        startedAt: test.startedAt ? toLocalIsoDate(test.startedAt) : null,
        createdAt: toLocalIsoDate(test.createdAt),
      })),
    });
  },
);
