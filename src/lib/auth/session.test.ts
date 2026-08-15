import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE_NAME } from "./constants";
import { getSession, getSessionOrThrow, isRoleAuthorized } from "./session";
import { signToken } from "./jwt";

const cookieValues = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));

describe("isRoleAuthorized", () => {
  it("allows a role contained in the allow list", () => {
    expect(isRoleAuthorized("admin", ["cosmetologist", "admin"])).toBe(true);
  });

  it("denies a role outside the allow list", () => {
    expect(isRoleAuthorized("client", ["cosmetologist", "admin"])).toBe(false);
  });

  it("denies every role for an empty allow list", () => {
    expect(isRoleAuthorized("admin", [])).toBe(false);
  });
});

describe("getSession", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-value-for-jwt-signing";
    cookieValues.clear();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("returns null when the auth cookie is missing", async () => {
    await expect(getSession()).resolves.toBeNull();
  });

  it("returns null when the auth cookie holds an invalid token", async () => {
    cookieValues.set(AUTH_COOKIE_NAME, "garbage");
    await expect(getSession()).resolves.toBeNull();
  });

  it("returns the payload for a valid token", async () => {
    cookieValues.set(
      AUTH_COOKIE_NAME,
      await signToken({
        userId: "user-7",
        email: "a@b.co",
        role: "client",
        sessionId: "sess-7",
      }),
    );

    const session = await getSession();
    expect(session?.sub).toBe("user-7");
    expect(session?.role).toBe("client");
  });
});

describe("getSessionOrThrow", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-value-for-jwt-signing";
    cookieValues.clear();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("throws Unauthorized without a session", async () => {
    await expect(getSessionOrThrow()).rejects.toThrow("Unauthorized");
  });

  it("returns the session when authenticated", async () => {
    cookieValues.set(
      AUTH_COOKIE_NAME,
      await signToken({
        userId: "user-8",
        email: "a@b.co",
        role: "admin",
        sessionId: "sess-8",
      }),
    );

    await expect(getSessionOrThrow()).resolves.toMatchObject({
      sub: "user-8",
      role: "admin",
    });
  });
});
