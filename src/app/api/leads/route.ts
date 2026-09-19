import { NextResponse, type NextRequest } from "next/server";
import { count, desc, lt } from "drizzle-orm";
import { db } from "@/db";
import { leads, leadSourceEnum } from "@/db/schema";
import { withRateLimit, withRole } from "@/lib/api/handlers";
import { getSearchParam, isNonEmptyString } from "@/lib/api/request";
import {
  badRequest,
  unauthorized,
  withErrorHandling,
} from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";

const SOURCES = leadSourceEnum.enumValues;
type LeadSource = (typeof SOURCES)[number];

const PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;
/** Ограничения на длину полей: вход машинный, без них токен позволяет залить что угодно. */
const MAX_LEN = { contact: 64, name: 200, text: 4000, campaign: 200 };
const INGEST_PER_MINUTE = 60;

function isSource(value: unknown): value is LeadSource {
  return SOURCES.includes(value as LeadSource);
}

function trimmed(value: unknown, max: number): string | null {
  return isNonEmptyString(value) ? value.trim().slice(0, max) : null;
}

/**
 * Курсорная выдача: `?before=<createdAt ISO>&limit=<n>`, плюс общее число лидов,
 * чтобы счётчик в панели не врал при выборке одной страницы.
 */
export const GET = withRole(
  "Ошибка загрузки лидов",
  MANAGER_ROLES,
  async (_session, request) => {
    const limitParam = Number(getSearchParam(request, "limit"));
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, MAX_PAGE_SIZE)
        : PAGE_SIZE;

    const before = getSearchParam(request, "before");
    const beforeDate = before ? new Date(before) : null;
    if (beforeDate && Number.isNaN(beforeDate.getTime())) {
      return badRequest("Неверный курсор before");
    }

    const rows = await db
      .select()
      .from(leads)
      .where(beforeDate ? lt(leads.createdAt, beforeDate) : undefined)
      .orderBy(desc(leads.createdAt))
      .limit(limit);

    const [totals] = await db.select({ value: count() }).from(leads);

    return NextResponse.json({
      leads: rows,
      total: totals?.value ?? rows.length,
      nextCursor:
        rows.length === limit
          ? rows[rows.length - 1].createdAt.toISOString()
          : null,
    });
  },
);

/**
 * Приём лида от локального агента (WhatsApp, мониторинги).
 * Авторизация — Bearer-токен LEADS_INGEST_TOKEN, сессия не нужна.
 */
export const POST = withRateLimit(
  "leads-ingest",
  INGEST_PER_MINUTE,
  withErrorHandling("Ошибка приёма лида", async (request: NextRequest) => {
    const token = process.env.LEADS_INGEST_TOKEN;
    if (!token) return unauthorized("Приём лидов не настроен");
    if (request.headers.get("authorization") !== `Bearer ${token}`) {
      return unauthorized();
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const data = body as Record<string, unknown>;

    const contact = trimmed(data.contact, MAX_LEN.contact);
    const incoming = trimmed(data.incoming, MAX_LEN.text);
    if (!contact) return badRequest("Нужно поле contact");
    if (!incoming) return badRequest("Нужно поле incoming");

    const [lead] = await db
      .insert(leads)
      .values({
        source: isSource(data.source) ? data.source : "whatsapp",
        contact,
        name: trimmed(data.name, MAX_LEN.name),
        incoming,
        draft: trimmed(data.draft, MAX_LEN.text),
        escalate: data.escalate === true,
        reason: trimmed(data.reason, MAX_LEN.text),
        campaign: trimmed(data.campaign, MAX_LEN.campaign),
      })
      .returning();

    return NextResponse.json({ lead }, { status: 201 });
  }),
);
