import { describe, expect, it } from "vitest";
import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from "./password";

describe("hashPassword / verifyPassword", () => {
  it("produces a bcrypt hash that is not the plaintext", async () => {
    const hash = await hashPassword("Str0ngPass");
    expect(hash).not.toBe("Str0ngPass");
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("produces a different hash for the same password (salted)", async () => {
    const [a, b] = await Promise.all([
      hashPassword("Str0ngPass"),
      hashPassword("Str0ngPass"),
    ]);
    expect(a).not.toBe(b);
  });

  it("verifies the correct password and rejects a wrong one", async () => {
    const hash = await hashPassword("Str0ngPass");
    await expect(verifyPassword("Str0ngPass", hash)).resolves.toBe(true);
    await expect(verifyPassword("str0ngpass", hash)).resolves.toBe(false);
  });
});

describe("validatePasswordStrength", () => {
  it("accepts a password with length, upper, lower and digit", () => {
    expect(validatePasswordStrength("Passw0rd")).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("reports a too short password", () => {
    const result = validatePasswordStrength("Pas5w");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters");
  });

  it("reports every missing character class", () => {
    const result = validatePasswordStrength("short");
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
    expect(result.errors).toEqual([
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter",
      "Password must contain at least one number",
    ]);
  });

  it("reports a missing lowercase letter", () => {
    expect(validatePasswordStrength("PASSW0RD").errors).toEqual([
      "Password must contain at least one lowercase letter",
    ]);
  });
});
