import { test } from "vitest";
import assert from "node:assert/strict";
import { checkRateLimit } from "@/lib/ai";

test("checkRateLimit allows requests up to the per-window limit", () => {
  const userId = `user-allow-${Date.now()}`;
  for (let i = 0; i < 30; i++) {
    assert.equal(checkRateLimit(userId), true);
  }
});

test("checkRateLimit blocks requests beyond the per-window limit", () => {
  const userId = `user-block-${Date.now()}`;
  for (let i = 0; i < 30; i++) {
    checkRateLimit(userId);
  }
  assert.equal(checkRateLimit(userId), false);
});

test("checkRateLimit isolates rate limits between users", () => {
  const a = `user-a-${Date.now()}`;
  const b = `user-b-${Date.now()}`;
  for (let i = 0; i < 30; i++) checkRateLimit(a);
  assert.equal(checkRateLimit(a), false);
  assert.equal(checkRateLimit(b), true);
});
