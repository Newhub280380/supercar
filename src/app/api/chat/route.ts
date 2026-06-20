import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  generateAIResponse,
  checkRateLimit,
  safetyFilter,
  type ChatMessage,
} from "@/lib/ai";
import type { SkinType } from "@/types";

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { conversationId, message, tone = "professional", skinType, concerns } = body as {
      conversationId?: string;
      message?: string;
      tone?: "professional" | "friendly";
      skinType?: SkinType;
      concerns?: string[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
    }

    const safety = safetyFilter(message);
    if (!safety.safe) {
      return NextResponse.json({ error: safety.reason }, { status: 400 });
    }

    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const topic = message.slice(0, 60);
      const [newConv] = await db
        .insert(aiConversations)
        .values({
          userId,
          topic,
          messages: [{ role: "user", content: message, timestamp: new Date().toISOString() }],
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
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
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

    const history = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, activeConversationId))
      .limit(1);

    const prevMessages: ChatMessage[] = (history[0].messages ?? []).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const aiResult = await generateAIResponse({
      conversationId: activeConversationId,
      messages: prevMessages,
      userId,
      tone,
      skinType,
      concerns,
    });

    const finalHistory = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, activeConversationId))
      .limit(1);

    const withReply = [
      ...(finalHistory[0].messages ?? []),
      { role: "assistant", content: aiResult.message, timestamp: new Date().toISOString() },
    ];

    await db
      .update(aiConversations)
      .set({ messages: withReply, updatedAt: new Date() })
      .where(eq(aiConversations.id, activeConversationId));

    return NextResponse.json({
      conversationId: activeConversationId,
      reply: aiResult.message,
      relatedProcedures: aiResult.relatedProcedures,
      relatedFAQ: aiResult.relatedFAQ,
      usage: aiResult.usage,
    });
  } catch (error) {
    console.error("Chat send message error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
