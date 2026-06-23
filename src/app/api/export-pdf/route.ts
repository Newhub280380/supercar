import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body as { conversationId?: string };

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

    const messages = conv.messages ?? [];
    const topic = conv.topic ?? "Консультация";
    const date = new Date(conv.createdAt).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Рекомендации — ${escapeHtml(topic)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: oklch(0.22 0.03 355);
    line-height: 1.6;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  }
  .header {
    border-bottom: 2px solid oklch(0.68 0.14 355);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .header h1 {
    font-size: 24px;
    color: oklch(0.50 0.12 355);
    margin-bottom: 4px;
  }
  .header .meta {
    font-size: 13px;
    color: oklch(0.50 0.02 355);
  }
  .message {
    margin-bottom: 20px;
    padding: 16px 20px;
    border-radius: 12px;
    position: relative;
  }
  .message.user {
    background: oklch(0.96 0.015 80);
    margin-left: 40px;
  }
  .message.assistant {
    background: oklch(0.98 0.02 5);
    margin-right: 40px;
    border: 1px solid oklch(0.91 0.04 5);
  }
  .message .role {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .message.user .role { color: oklch(0.50 0.10 250); }
  .message.assistant .role { color: oklch(0.50 0.12 355); }
  .message .content {
    font-size: 14px;
    white-space: pre-wrap;
  }
  .message .time {
    font-size: 11px;
    color: oklch(0.50 0.02 355);
    margin-top: 6px;
  }
  .disclaimer {
    margin-top: 32px;
    padding: 16px;
    background: oklch(0.96 0.02 80);
    border-radius: 8px;
    border-left: 4px solid oklch(0.78 0.13 80);
    font-size: 12px;
    color: oklch(0.40 0.02 355);
  }
  .footer {
    margin-top: 24px;
    text-align: center;
    font-size: 12px;
    color: oklch(0.50 0.02 355);
  }
  @media print {
    body { padding: 20px; }
    .message { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>AI-Консультация по косметологии</h1>
    <div class="meta">${escapeHtml(topic)} · ${escapeHtml(date)}</div>
  </div>

  ${messages.map((m) => {
    const isUser = m.role === "user";
    const time = m.timestamp
      ? new Date(m.timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
      : "";
    return `<div class="message ${isUser ? "user" : "assistant"}">
      <div class="role">${isUser ? "Вы" : "AI-консультант"}</div>
      <div class="content">${escapeHtml(m.content)}</div>
      ${time ? `<div class="time">${time}</div>` : ""}
    </div>`;
  }).join("")}

  <div class="disclaimer">
    <strong>Важно:</strong> Данные рекомендации носят информационный характер и не заменяют консультацию специалиста. Для индивидуального подбора процедур обратитесь к сертифицированному косметологу.
  </div>

  <div class="footer">
    AI Cosmetology Platform · ${new Date().getFullYear()}
  </div>

  <script>
    window.onload = function() {
      if (window.opener) {
        window.print();
      }
    };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="recommendations-${conversationId}.html"`,
      },
    });
  } catch (error) {
    console.error("Export PDF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
