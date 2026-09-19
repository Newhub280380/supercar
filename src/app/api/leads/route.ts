import { NextResponse, type NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { leads, leadSourceEnum } from "@/db/schema";
import { withRole } from "@/lib/api/handlers";
import { isNonEmptyString } from "@/lib/api/request";
import {
  badRequest,
  unauthorized,
  withErrorHandling,
} from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";

const SOURCES = leadSourceEnum.enumValues;
type LeadSource = (typeof SOURCES)[number];

function isSource(value: unknown): value is LeadSource {
  return SOURCES.includes(value as LeadSource);
}

export const GET = withRole(
  "Ошибка загрузки лидов",
  MANAGER_ROLES,
  async () => {
    const rows = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(200);

    return NextResponse.json({ leads: rows });
  },
);

/**
 * Приём лида от локального агента (WhatsApp, мониторинги).
 * Авторизация — Bearer-токен LEADS_INGEST_TOKEN, сессия не нужна.
 */
export const POST = withErrorHandling(
  "Ошибка приёма лида",
  async (request: NextRequest) => {
    const token = process.env.LEADS_INGEST_TOKEN;
    if (!token) return unauthorized("Приём лидов не настроен");
    if (request.headers.get("authorization") !== `Bearer ${token}`) {
      return unauthorized();
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const data = body as Record<string, unknown>;

    if (!isNonEmptyString(data.contact))
      return badRequest("Нужно поле contact");
    if (!isNonEmptyString(data.incoming))
      return badRequest("Нужно поле incoming");

    const [lead] = await db
      .insert(leads)
      .values({
        source: isSource(data.source) ? data.source : "whatsapp",
        contact: data.contact.trim(),
        name: isNonEmptyString(data.name) ? data.name.trim() : null,
        incoming: data.incoming.trim(),
        draft: isNonEmptyString(data.draft) ? data.draft.trim() : null,
        escalate: data.escalate === true,
        reason: isNonEmptyString(data.reason) ? data.reason.trim() : null,
        campaign: isNonEmptyString(data.campaign) ? data.campaign.trim() : null,
      })
      .returning();

    return NextResponse.json({ lead }, { status: 201 });
  },
);
