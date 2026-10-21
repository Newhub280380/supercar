import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { withRateLimit } from "@/lib/api/handlers";
import { isNonEmptyString } from "@/lib/api/request";
import { badRequest, withErrorHandling } from "@/lib/api/response";

const TOPICS: Record<string, string> = {
  general: "Общий вопрос",
  demo: "Запрос демо",
  partnership: "Партнёрство",
  support: "Техподдержка",
};

/**
 * Публичная форма /contact пишет лид в ту же таблицу, что и входящие.
 * Письмо при этом не отправляется: почтового ключа форма не требует.
 */
export const POST = withRateLimit(
  "site-contact",
  10,
  withErrorHandling("Ошибка формы контактов", async (request: NextRequest) => {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const data = body as Record<string, unknown>;

    const email = isNonEmptyString(data.email) ? data.email.trim() : "";
    const name = isNonEmptyString(data.name) ? data.name.trim() : "";
    const message = isNonEmptyString(data.message) ? data.message.trim() : "";
    if (!email.includes("@") || email.length > 64) {
      return badRequest("Нужен email не длиннее 64 символов");
    }
    if (!name || name.length > 200) return badRequest("Нужно имя");
    if (!message || message.length > 4000) return badRequest("Нужен текст");

    const topicKey = isNonEmptyString(data.topic) ? data.topic : "general";
    const topic = TOPICS[topicKey] ?? TOPICS.general;

    const [lead] = await db
      .insert(leads)
      .values({
        source: "site",
        contact: email,
        name: name.slice(0, 200),
        incoming: `[${topic}] ${message}`.slice(0, 4000),
        status: "new",
      })
      .returning({ id: leads.id });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  }),
);
