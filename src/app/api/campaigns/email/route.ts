import { desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailCampaigns, subscriberLists, subscribers } from "@/db/schema";
import { parseJsonBody } from "@/lib/api-utils";
import { withRole } from "@/lib/api/handlers";
import { badRequest } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import { toLocalIsoDate } from "@/lib/format";

function toCampaign(row: typeof emailCampaigns.$inferSelect) {
  return {
    id: row.id,
    subject: row.subject,
    content: row.content,
    templateName: null,
    listName: "—",
    status: row.status,
    recipientCount: 0,
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    metrics: row.metrics
      ? {
          sent: row.metrics.sent ?? 0,
          opened: row.metrics.opened ?? 0,
          clicked: row.metrics.clicked ?? 0,
          bounced: row.metrics.bounced ?? 0,
        }
      : null,
    createdAt: toLocalIsoDate(row.createdAt),
  };
}

export const GET = withRole(
  "List email campaigns error",
  MANAGER_ROLES,
  async (session) => {
    const [campaignRows, lists] = await Promise.all([
      db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.userId, session.sub))
        .orderBy(desc(emailCampaigns.createdAt)),
      db
        .select()
        .from(subscriberLists)
        .where(eq(subscriberLists.userId, session.sub)),
    ]);

    const listIds = lists.map((list) => list.id);
    const own =
      listIds.length === 0
        ? []
        : await db
            .select()
            .from(subscribers)
            .where(inArray(subscribers.listId, listIds));
    const listName = new Map(lists.map((list) => [list.id, list.name]));

    return NextResponse.json({
      campaigns: campaignRows.map(toCampaign),
      lists: lists.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        subscriberCount: list.subscriberCount,
        createdAt: toLocalIsoDate(list.createdAt),
      })),
      subscribers: own.map((person) => ({
        id: person.id,
        listId: person.listId,
        listName: listName.get(person.listId) ?? "",
        email: person.email,
        name: person.name ?? "",
        phone: person.phone ?? "",
        status: person.status,
        subscribedAt: toLocalIsoDate(person.subscribedAt),
      })),
    });
  },
);

export const POST = withRole(
  "Create email campaign error",
  MANAGER_ROLES,
  async (session, request: NextRequest) => {
    const { data: body, error } = await parseJsonBody(request);
    if (error) return error;
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!subject) return badRequest("Нужна тема письма");
    if (!content) return badRequest("Нужен текст письма");

    const [row] = await db
      .insert(emailCampaigns)
      .values({
        userId: session.sub,
        subject: subject.slice(0, 300),
        content: content.slice(0, 20000),
        status: "draft",
      })
      .returning();

    return NextResponse.json({ campaign: toCampaign(row) }, { status: 201 });
  },
);
