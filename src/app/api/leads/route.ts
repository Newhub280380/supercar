import { NextResponse, type NextRequest } from "next/server";
import { and, count, desc, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { leads, leadSourceEnum, leadStatusEnum } from "@/db/schema";
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
const STATUSES = leadStatusEnum.enumValues;
type LeadStatus = (typeof STATUSES)[number];

const PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;
/** Ограничения на длину полей: вход машинный, без них токен позволяет залить что угодно. */
const MAX_LEN = { contact: 64, name: 200, text: 4000, campaign: 200 };
const INGEST_PER_MINUTE = 60;
/** Окно слияния: тот же контакт с тем же текстом за час — это дубль, а не новый лид. */
const MERGE_WINDOW_MS = 60 * 60 * 1000;

function isSource(value: unknown): value is LeadSource {
  return SOURCES.includes(value as LeadSource);
}

function isStatus(value: unknown): value is LeadStatus {
  return STATUSES.includes(value as LeadStatus);
}

function trimmed(value: unknown, max: number): string | null {
  return isNonEmptyString(value) ? value.trim().slice(0, max) : null;
}

/** Машинный доступ агента по тому же токену, что и приём лидов. */
function hasIngestToken(request: NextRequest): boolean {
  const token = process.env.LEADS_INGEST_TOKEN;
  return (
    !!token && request.headers.get("authorization") === `Bearer ${token}`
  );
}

async function listLeads(request: NextRequest): Promise<NextResponse> {
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

  const filters = [];
  if (beforeDate) filters.push(lt(leads.createdAt, beforeDate));

  const statusParam = getSearchParam(request, "status");
  // unanswered=1 — короткий фильтр «ещё не отвечено» для агента-ответчика.
  const unanswered = getSearchParam(request, "unanswered") === "1";
  const status = unanswered ? "new" : statusParam;
  if (status) {
    if (!isStatus(status)) return badRequest("Неверный status");
    filters.push(eq(leads.status, status));
  }

  const contact = getSearchParam(request, "contact");
  if (contact) filters.push(eq(leads.contact, contact.slice(0, MAX_LEN.contact)));

  const rows = await db
    .select()
    .from(leads)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(limit);

  const [totals] = await db
    .select({ value: count() })
    .from(leads)
    .where(filters.length ? and(...filters) : undefined);

  return NextResponse.json({
    leads: rows,
    total: totals?.value ?? rows.length,
    nextCursor:
      rows.length === limit ? rows[rows.length - 1].createdAt.toISOString() : null,
  });
}

/**
 * Курсорная выдача: `?before=<createdAt ISO>&limit=<n>` + фильтры
 * `?status=new`, `?contact=`, `?unanswered=1`.
 * Доступ: сессия менеджера или Bearer LEADS_INGEST_TOKEN (для агента на сервере).
 */
const sessionList = withRole(
  "Ошибка загрузки лидов",
  MANAGER_ROLES,
  async (_session, request) => listLeads(request),
);

export const GET = withErrorHandling(
  "Ошибка загрузки лидов",
  async (request: NextRequest) => {
    if (hasIngestToken(request)) return listLeads(request);
    return sessionList(request);
  },
);

/**
 * Приём лида от локального агента (WhatsApp, мониторинги).
 * Авторизация — Bearer-токен LEADS_INGEST_TOKEN, сессия не нужна.
 * Если за последний час уже есть лид со статусом new с тем же контактом и текстом —
 * обновляем его полями черновика вместо дубля (Wazzup и HUB видят одно сообщение).
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

    const [dupe] = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.contact, contact),
          eq(leads.incoming, incoming),
          eq(leads.status, "new"),
          gt(leads.createdAt, new Date(Date.now() - MERGE_WINDOW_MS)),
        ),
      )
      .limit(1);

    if (dupe) {
      const [lead] = await db
        .update(leads)
        .set({
          draft: trimmed(data.draft, MAX_LEN.text) ?? dupe.draft,
          escalate: data.escalate === true || dupe.escalate,
          reason: trimmed(data.reason, MAX_LEN.text) ?? dupe.reason,
          campaign: trimmed(data.campaign, MAX_LEN.campaign) ?? dupe.campaign,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, dupe.id))
        .returning();
      return NextResponse.json({ lead, merged: true });
    }

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
