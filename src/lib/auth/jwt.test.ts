import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { signToken, verifyToken } from "./jwt";

const SECRET = "test-secret-value-for-jwt-signing";

const payload = {
  userId: "user-1",
  email: "user@example.com",
  role: "cosmetologist" as const,
  sessionId: "session-1",
};

describe("signToken / verifyToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("round-trips the payload claims", async () => {
    const token = await signToken(payload);
    const verified = await verifyToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe("user-1");
    expect(verified?.email).toBe("user@example.com");
    expect(verified?.role).toBe("cosmetologist");
    expect(verified?.jti).toBe("session-1");
  });

  it("sets issued-at and expiry claims", async () => {
    const verified = await verifyToken(await signToken(payload));
    expect(typeof verified?.iat).toBe("number");
    expect(verified?.exp).toBeGreaterThan(verified!.iat!);
  });

  it("returns null for a malformed token", async () => {
    await expect(verifyToken("not-a-jwt")).resolves.toBeNull();
  });

  it("returns null for a token signed with another secret", async () => {
    const foreign = await new SignJWT({ sub: "user-1" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("a-different-secret-value-entirely"));

    await expect(verifyToken(foreign)).resolves.toBeNull();
  });

  it("returns null for an expired token", async () => {
    const expired = await new SignJWT({ sub: "user-1" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(SECRET));

    await expect(verifyToken(expired)).resolves.toBeNull();
  });

  it("throws when JWT_SECRET is not configured", async () => {
    delete process.env.JWT_SECRET;
    await expect(signToken(payload)).rejects.toThrow(
      "JWT_SECRET environment variable is required",
    );
  });
});
