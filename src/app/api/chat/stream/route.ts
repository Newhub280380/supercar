import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  streamAIResponse,
  checkRateLimit,
  safetyFilter,
  type ChatMessage,
} from "@/lib/ai";
import { logger } from "@/lib/logger";
import type { SkinType } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SSEEvent =
  | { type: "ready"; conversationId: string }
  | { type: "token"; token: string }
  | {
      type: "done";
      conversationId: string;
      reply: string;
      relatedProcedures: string[];
      relatedFAQ: string[];
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  | { type: "error"; error: string };

function sseEncode(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest) {
  const log = logger.scope("api:chat:stream");

  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Подождите минуту." },
      { status: 429 },
    );
  }

  let body: {
    conversationId?: string;
    message?: string;
    tone?: "professional" | "friendly";
    skinType?: SkinType;
    concerns?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const { conversationId, message, tone = "professional", skinType, concerns } = body;

  if (!message || !message.trim()) {
    return NextResponse.json(
      { error: "Сообщение не может быть пустым" },
      { status: 400 },
    );
  }

  const safety = safetyFilter(message);
  if (!safety.safe) {
    return NextResponse.json({ error: safety.reason }, { status: 400 });
  }

  const abortController = new AbortController();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const closed = { value: false };

      const send = (event: SSEEvent) => {
        if (closed.value) return;
        try {
          controller.enqueue(encoder.encode(sseEncode(event)));
        } catch {
          closed.value = true;
        }
      };

      request.signal.addEventListener("abort", () => {
        abortController.abort();
      });

      try {
        let activeConversationId = conversationId;

        if (!activeConversationId) {
          const topic = message.slice(0, 60);
          const [newConv] = await db
            .insert(aiConversations)
            .values({
              userId,
              topic,
              messages: [
                { role: "user", content: message, timestamp: new Date().toISOString() },
              ],
            })
            .returning();
          activeConversationId = newConv.id;
        } else {
          const [existing] = await db
            .select()
            .from(aiConversations)
            .where(eq(aiConversations.id, activeConversationId))
            .limit(1);

          if (!existing || existing.userId !== userId) {
            send({ type: "error", error: "Conversation not found" });
            controller.close();
            return;
          }

          const updatedMessages = [
            ...(existing.messages ?? []),
            { role: "user", content: message, timestamp: new Date().toISOString() },
          ];
          await db
            .update(aiConversations)
            .set({ messages: updatedMessages, updatedAt: new Date() })
            .where(eq(aiConversations.id, activeConversationId));
        }

        const [history] = await db
          .select()
          .from(aiConversations)
          .where(eq(aiConversations.id, activeConversationId))
          .limit(1);

        const prevMessages: ChatMessage[] = (history?.messages ?? []).map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: typeof m.content === "string" ? m.content : "",
        }));

        send({ type: "ready", conversationId: activeConversationId });

        const aiResult = await streamAIResponse(
          {
            conversationId: activeConversationId,
            messages: prevMessages,
            userId,
            tone,
            skinType,
            concerns,
          },
          {
            onToken: (token) => send({ type: "token", token }),
            signal: abortController.signal,
          },
        );

        const [finalHistory] = await db
          .select()
          .from(aiConversations)
          .where(eq(aiConversations.id, activeConversationId))
          .limit(1);

        const withReply = [
          ...(finalHistory?.messages ?? []),
          {
            role: "assistant",
            content: aiResult.message,
            timestamp: new Date().toISOString(),
          },
        ];

        await db
          .update(aiConversations)
          .set({ messages: withReply, updatedAt: new Date() })
          .where(eq(aiConversations.id, activeConversationId));

        log.info("stream completed", {
          conversationId: activeConversationId,
          usage: aiResult.usage,
        });

        send({
          type: "done",
          conversationId: activeConversationId,
          reply: aiResult.message,
          relatedProcedures: aiResult.relatedProcedures,
          relatedFAQ: aiResult.relatedFAQ,
          usage: aiResult.usage,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          log.info("stream aborted by client");
        } else {
          log.error("stream failed", error);
          send({
            type: "error",
            error: "Внутренняя ошибка сервера",
          });
        }
      } finally {
        if (!closed.value) {
          try {
            controller.close();
          } catch {
            // already closed
          }
          closed.value = true;
        }
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
