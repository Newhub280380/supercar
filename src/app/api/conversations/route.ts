import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { withUserId } from "@/lib/api/handlers";
import { getSearchParam } from "@/lib/api/request";
import { badRequest, notFound } from "@/lib/api/response";

export const GET = withUserId("Error fetching conversations", async (userId) => {
  const conversations = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.userId, userId))
    .orderBy(desc(aiConversations.updatedAt));

  return NextResponse.json({ conversations });
});

export const DELETE = withUserId("Error deleting conversation", async (userId, request) => {
  const conversationId = getSearchParam(request, "id");

  if (!conversationId) {
    return badRequest("Conversation ID required");
  }

  const [conv] = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId))
    .limit(1);

  if (!conv || conv.userId !== userId) {
    return notFound();
  }

  await db.delete(aiConversations).where(eq(aiConversations.id, conversationId));

  return NextResponse.json({ success: true });
});
