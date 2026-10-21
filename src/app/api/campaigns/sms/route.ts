import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { smsCampaigns } from "@/db/schema";
import { parseJsonBody } from "@/lib/api-utils";
import { withRole } from "@/lib/api/handlers";
import { badRequest } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import { toLocalIsoDate } from "@/lib/format";

function toCampaign(row: typeof smsCampaigns.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    type: "notification" as const,
    status: row.status,
    recipientCount: row.recipientCount,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    metrics: row.metrics
      ? {
          sent: row.metrics.sent ?? 0,
          delivered: row.metrics.delivered ?? 0,
          failed: row.metrics.failed ?? 0,
        }
      : null,
    createdAt: toLocalIsoDate(row.createdAt),
  };
}

export const GET = withRole(
  "List SMS campaigns error",
  MANAGER_ROLES,
  async (session) => {
    const rows = await db
      .select()
      .from(smsCampaigns)
      .where(eq(smsCampaigns.userId, session.sub))
      .orderBy(desc(smsCampaigns.createdAt));
    return NextResponse.json({ campaigns: rows.map(toCampaign) });
  },
);

export const POST = withRole(
  "Create SMS campaign error",
  MANAGER_ROLES,
  async (session, request: NextRequest) => {
    const { data: body, error } = await parseJsonBody(request);
    if (error) return error;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!name) return badRequest("Нужно название");
    if (!content) return badRequest("Нужен текст SMS");
    const [row] = await db
      .insert(smsCampaigns)
      .values({
        userId: session.sub,
        name: name.slice(0, 200),
        content: content.slice(0, 1000),
        status: "draft",
      })
      .returning();
    return NextResponse.json(
      {
        campaign: toCampaign(row),
        notice:
          "Черновик сохранён. Отправка SMS не подключена: нет ключа провайдера.",
      },
      { status: 201 },
    );
  },
);
