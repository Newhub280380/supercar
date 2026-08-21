import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import {
  generateAIResponse,
  checkRateLimit,
  safetyFilter,
  type ChatMessage,
} from "@/lib/ai";
import { logger } from "@/lib/logger";
import { withUserId } from "@/lib/api/handlers";
import { badRequest, notFound, tooManyRequests } from "@/lib/api/response";
import {
  appendMessage,
  getConversation,
  getOwnedConversation,
} from "@/lib/conversations";
import type { SkinType } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const log = logger.scope("api:chat");

export const POST = withUserId(
  "Chat send message error",
  async (userId, request) => {
    if (!checkRateLimit(userId)) {
      return tooManyRequests("Слишком много запросов. Подождите минуту.");
    }

    const body = await request.json();
    const {
      conversationId,
      message,
      tone = "professional",
      skinType,
      concerns,
    } = body as {
      conversationId?: string;
      message?: string;
      tone?: "professional" | "friendly";
      skinType?: SkinType;
      concerns?: string[];
    };

    if (!message?.trim()) {
      return badRequest("Сообщение не может быть пустым");
    }

    const safety = safetyFilter(message);
    if (!safety.safe) {
      return badRequest(safety.reason ?? "Сообщение отклонено");
    }

    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const [newConv] = await db
        .insert(aiConversations)
        .values({
          userId,
          topic: message.slice(0, 60),
          messages: [
            {
              role: "user",
              content: message,
              timestamp: new Date().toISOString(),
            },
          ],
        })
        .returning();
      activeConversationId = newConv.id;
    } else {
      const existing = await getOwnedConversation(activeConversationId, userId);
      if (!existing) {
        return notFound("Conversation not found");
      }
      await appendMessage(existing, { role: "user", content: message });
    }

    const history = await getConversation(activeConversationId);
    const prevMessages: ChatMessage[] = (history?.messages ?? []).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: typeof m.content === "string" ? m.content : "",
    }));

    const aiResult = await generateAIResponse({
      conversationId: activeConversationId,
      messages: prevMessages,
      userId,
      tone,
      skinType,
      concerns,
    });

    const finalHistory = await getConversation(activeConversationId);
    if (finalHistory) {
      await appendMessage(finalHistory, {
        role: "assistant",
        content: aiResult.message,
      });
    }

    log.info("message handled", {
      conversationId: activeConversationId,
      usage: aiResult.usage,
    });

    return NextResponse.json({
      conversationId: activeConversationId,
      reply: aiResult.message,
      relatedProcedures: aiResult.relatedProcedures,
      relatedFAQ: aiResult.relatedFAQ,
      usage: aiResult.usage,
    });
  },
  "Внутренняя ошибка сервера",
);
