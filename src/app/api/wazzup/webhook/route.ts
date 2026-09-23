import { NextResponse, type NextRequest } from "next/server";
import { and, gt, inArray } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { getSearchParam } from "@/lib/api/request";
import { unauthorized, withErrorHandling } from "@/lib/api/response";

/** Ограничения на длину: вход машинный и внешний. */
const MAX_LEN = { contact: 64, name: 200, text: 4000 };

type WazzupContact = { name?: unknown };

type WazzupMessage = {
  chatId?: unknown;
  chatType?: unknown;
  text?: unknown;
  status?: unknown;
  isEcho?: unknown;
  authorName?: unknown;
  contact?: WazzupContact;
};

function trimmed(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : null;
}

/** Входящее сообщение от клиента: не эхо нашего ответа и со статусом inbound. */
function isInbound(message: WazzupMessage): boolean {
  return message.isEcho !== true && message.status === "inbound";
}

/** Окно, внутри которого повторная доставка того же сообщения считается дублем. */
const DEDUP_WINDOW_MS = 10 * 60 * 1000;

/**
 * Приём событий Wazzup: входящее сообщение клиента становится лидом.
 * Wazzup умеет только URI вебхука, поэтому токен передаётся в query (`?token=`).
 * На проверочный запрос и на события без сообщений отвечаем 200, иначе Wazzup
 * отключит вебхук.
 */
export const POST = withErrorHandling(
  "Ошибка вебхука Wazzup",
  async (request: NextRequest) => {
    const token = process.env.WAZZUP_WEBHOOK_TOKEN;
    if (!token) return unauthorized("Вебхук Wazzup не настроен");
    if (getSearchParam(request, "token") !== token) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    const messages =
      body &&
      typeof body === "object" &&
      Array.isArray((body as { messages?: unknown }).messages)
        ? (body as { messages: WazzupMessage[] }).messages
        : [];

    const rows = messages.filter(isInbound).flatMap((message) => {
      const contact = trimmed(message.chatId, MAX_LEN.contact);
      const incoming = trimmed(message.text, MAX_LEN.text);
      if (!contact || !incoming) return [];
      return [
        {
          source: message.chatType === "instagram" ? "instagram" : "whatsapp",
          contact,
          name:
            trimmed(message.contact?.name, MAX_LEN.name) ??
            trimmed(message.authorName, MAX_LEN.name),
          incoming,
          campaign: "wazzup",
        } as const,
      ];
    });

    // Дедупликация: Wazzup может прислать то же сообщение повторно (ретрай,
    // переподписка), а параллельный канал через HUB — тот же текст ещё раз.
    // Если за последние 10 минут уже есть лид с тем же контактом и текстом — пропускаем.
    let fresh = rows;
    if (rows.length > 0) {
      const contacts = [...new Set(rows.map((row) => row.contact))];
      const recent = await db
        .select({ contact: leads.contact, incoming: leads.incoming })
        .from(leads)
        .where(
          and(
            gt(leads.createdAt, new Date(Date.now() - DEDUP_WINDOW_MS)),
            inArray(leads.contact, contacts),
          ),
        );
      const seen = new Set(recent.map((row) => `${row.contact}\n${row.incoming}`));
      fresh = rows.filter((row) => !seen.has(`${row.contact}\n${row.incoming}`));
    }

    if (fresh.length > 0) await db.insert(leads).values(fresh);

    return NextResponse.json({
      accepted: fresh.length,
      deduped: rows.length - fresh.length,
    });
  },
);

/** Wazzup проверяет доступность адреса и ждёт 200. */
export const GET = withErrorHandling("Ошибка вебхука Wazzup", async () =>
  NextResponse.json({ ok: true }),
);
