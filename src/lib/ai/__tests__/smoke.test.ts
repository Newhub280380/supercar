import { test } from "node:test";
import assert from "node:assert/strict";
import { safetyFilter } from "@/lib/ai";

test("smoke: safetyFilter allows a normal message", () => {
  const r = safetyFilter("Какая процедура подходит для сухой кожи?");
  assert.equal(r.safe, true);
});
