import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads, leadStatusEnum } from "@/db/schema";
import { isNonEmptyString } from "@/lib/api/request";
import {
  badRequest,
  notFound,
  unauthorized,
  withErrorHandling,
} from "@/lib/api/response";

const MAX_LEN = { text: 4000 };

function trimmed(value: unknown, max: number): string | null | undefined {
  if (value === undefined) return undefined;
  return isNonEmptyString(value) ? value.trim().slice(0, max) : null;
}

/**
 * Обновление лида агентом-ответчиком: записать ответ (draft), эскалацию
 * и статус (new → in_progress после реальной отправки).
 * Авторизация — Bearer LEADS_INGEST_TOKEN, сессия не нужна.
 */
export const PATCH = withErrorHandling(
  "Ошибка обновления лида",
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const token = process.env.LEADS_INGEST_TOKEN;
    if (!token) return unauthorized("Приём лидов не настроен");
    if (request.headers.get("authorization") !== `Bearer ${token}`) {
      return unauthorized();
    }

    const { id } = await params;
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const data = body as Record<string, unknown>;

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (data.status !== undefined) {
      if (!leadStatusEnum.enumValues.includes(data.status as never)) {
        return badRequest("Неверный status");
      }
      patch.status = data.status;
    }
    const draft = trimmed(data.draft, MAX_LEN.text);
    if (draft !== undefined) patch.draft = draft;
    const reason = trimmed(data.reason, MAX_LEN.text);
    if (reason !== undefined) patch.reason = reason;
    if (data.escalate !== undefined) patch.escalate = data.escalate === true;

    const [lead] = await db
      .update(leads)
      .set(patch)
      .where(eq(leads.id, id))
      .returning();

    if (!lead) return notFound("Лид не найден");
    return NextResponse.json({ lead });
  },
);
