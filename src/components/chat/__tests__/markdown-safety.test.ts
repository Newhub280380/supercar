import { test } from "vitest";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatMessage } from "@/components/chat/chat-message";
import type { Message } from "@/hooks/use-chat";

function makeMessage(content: unknown): Message {
  return {
    id: "m1",
    role: "assistant",
    content: content as string,
    timestamp: new Date().toISOString(),
  };
}

function render(content: unknown): string {
  return renderToStaticMarkup(
    createElement(ChatMessage, {
      message: makeMessage(content),
      isLatest: true,
    }),
  );
}

test("ChatMessage does NOT crash on undefined content (blank-screen root cause)", () => {
  assert.doesNotThrow(() => {
    const html = render(undefined);
    assert.ok(typeof html === "string");
  });
});

test("ChatMessage does NOT crash on null content", () => {
  assert.doesNotThrow(() => {
    render(null);
  });
});

test("ChatMessage renders normal markdown content", () => {
  const html = render("### Заголовок\n**жирный** текст");
  assert.ok(html.includes("Заголовок"));
  assert.ok(html.includes("жирный"));
});

test("ChatMessage handles invalid timestamp without showing 'Invalid Date'", () => {
  const html = renderToStaticMarkup(
    createElement(ChatMessage, {
      message: {
        id: "m1",
        role: "user",
        content: "hi",
        timestamp: "not-a-date",
      } as Message,
      isLatest: false,
    }),
  );
  assert.ok(!html.includes("Invalid Date"));
});
