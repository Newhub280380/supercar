import { test, beforeAll, afterAll } from "vitest";
import assert from "node:assert/strict";
import { generateAIResponse, streamAIResponse } from "@/lib/ai";

const originalKey = process.env.OPENAI_API_KEY;

beforeAll(() => {
  delete process.env.OPENAI_API_KEY;
});

afterAll(() => {
  if (originalKey !== undefined) {
    process.env.OPENAI_API_KEY = originalKey;
  } else {
    delete process.env.OPENAI_API_KEY;
  }
});

test("generateAIResponse returns a string message even without an API key (fallback)", async () => {
  const result = await generateAIResponse({
    conversationId: "c1",
    messages: [{ role: "user", content: "Что такое биоревитализация?" }],
    userId: "u1",
    tone: "professional",
  });
  assert.equal(typeof result.message, "string");
  assert.ok(result.message.length > 0);
  assert.ok(Array.isArray(result.relatedProcedures));
  assert.ok(Array.isArray(result.relatedFAQ));
});

test("streamAIResponse streams a string message via callback even without an API key", async () => {
  const tokens: string[] = [];
  const result = await streamAIResponse(
    {
      conversationId: "c1",
      messages: [{ role: "user", content: "Как ухаживать за жирной кожей?" }],
      userId: "u1",
      tone: "friendly",
    },
    { onToken: (t) => tokens.push(t) },
  );
  assert.equal(typeof result.message, "string");
  assert.ok(result.message.length > 0);
  assert.ok(tokens.length > 0);
  assert.equal(tokens.join(""), result.message);
});
