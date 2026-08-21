import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { eq } from "drizzle-orm";

type Conversation = typeof aiConversations.$inferSelect;
type ConversationMessage = Conversation["messages"][number];

export async function getConversation(
  id: string,
): Promise<Conversation | null> {
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.id, id))
    .limit(1);
  return conversation ?? null;
}

/** Returns the conversation only when it belongs to the given user. */
export async function getOwnedConversation(
  id: string,
  userId: string,
): Promise<Conversation | null> {
  const conversation = await getConversation(id);
  return conversation && conversation.userId === userId ? conversation : null;
}

export async function appendMessage(
  conversation: Conversation,
  message: Omit<ConversationMessage, "timestamp">,
): Promise<void> {
  await db
    .update(aiConversations)
    .set({
      messages: [
        ...conversation.messages,
        { ...message, timestamp: new Date().toISOString() },
      ],
      updatedAt: new Date(),
    })
    .where(eq(aiConversations.id, conversation.id));
}
