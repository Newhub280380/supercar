import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    const { session, response } = await requireSession();
    if (response) return response;
    const userId = session.sub;

    const conversations = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { session, response } = await requireSession();
    if (response) return response;
    const userId = session.sub;

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("id");

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    const [conv] = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, conversationId))
      .limit(1);

    if (!conv || conv.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.delete(aiConversations).where(eq(aiConversations.id, conversationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
