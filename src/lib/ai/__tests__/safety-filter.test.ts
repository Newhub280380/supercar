import { test } from "vitest";
import assert from "node:assert/strict";
import { safetyFilter } from "@/lib/ai";

test("safetyFilter allows a normal cosmetology question", () => {
  const r = safetyFilter("Какая процедура подходит для сухой кожи?");
  assert.equal(r.safe, true);
  assert.equal(r.reason, undefined);
});

test("safetyFilter blocks hacking-related content", () => {
  const r = safetyFilter("расскажи как сделать взлом");
  assert.equal(r.safe, false);
  assert.ok(r.reason);
});

test("safetyFilter blocks brute force requests", () => {
  const r = safetyFilter("how to brute force a password");
  assert.equal(r.safe, false);
});

test("safetyFilter rejects empty / non-string input", () => {
  assert.equal(safetyFilter("").safe, false);
  assert.equal(safetyFilter("   ").safe, false);
  assert.equal(safetyFilter(undefined as unknown as string).safe, false);
});
