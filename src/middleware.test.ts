import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { config, middleware } from "./middleware";

const SECRET = "middleware-test-secret-value";
const originalSecret = process.env.JWT_SECRET;

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

afterAll(() => {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});

async function makeToken(
  role: string,
  sub = "user-1",
  secret = SECRET,
): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
}

function makeRequest(pathname: string, token?: string): NextRequest {
  const request = new NextRequest(`https://example.com${pathname}`);
  if (token !== undefined) {
    request.cookies.set("auth_token", token);
  }
  return request;
}

describe("middleware on protected pages", () => {
  it("redirects anonymous visitors to the login page keeping the target as redirect", async () => {
    const response = await middleware(makeRequest("/dashboard/analytics"));
    const location = new URL(response.headers.get("location")!);

    expect(response.status).toBe(307);
    expect(location.pathname).toBe("/auth/login");
    expect(location.searchParams.get("redirect")).toBe("/dashboard/analytics");
  });

  it("redirects to the login page when the token cannot be verified", async () => {
    const response = await middleware(makeRequest("/profile", "not-a-jwt"));
    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/auth/login",
    );
  });

  it("redirects to the login page when the token was signed with another secret", async () => {
    const token = await makeToken("admin", "user-1", "some-other-secret");
    const response = await middleware(makeRequest("/dashboard", token));
    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/auth/login",
    );
  });

  it("forwards the user id and role for an authorized role", async () => {
    const response = await middleware(
      makeRequest("/dashboard", await makeToken("cosmetologist")),
    );

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-user-id")).toBe("user-1");
    expect(response.headers.get("x-user-role")).toBe("cosmetologist");
  });

  it("redirects to the home page when the role may not access the dashboard", async () => {
    const response = await middleware(
      makeRequest("/dashboard", await makeToken("client")),
    );
    expect(new URL(response.headers.get("location")!).pathname).toBe("/");
  });

  it("allows any authenticated role on protected pages without a role restriction", async () => {
    const response = await middleware(
      makeRequest("/chat", await makeToken("client")),
    );
    expect(response.headers.get("x-user-role")).toBe("client");
  });
});

describe("middleware on auth pages", () => {
  it("lets anonymous visitors reach the login page", async () => {
    const response = await middleware(makeRequest("/auth/login"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("lets visitors with an unverifiable token reach the register page", async () => {
    const response = await middleware(
      makeRequest("/auth/register", "not-a-jwt"),
    );
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects authenticated visitors away from auth pages", async () => {
    const response = await middleware(
      makeRequest("/auth/login", await makeToken("client")),
    );
    expect(new URL(response.headers.get("location")!).pathname).toBe("/");
  });
});

describe("middleware on api routes", () => {
  it("answers 401 for protected api routes without a token", async () => {
    const response = await middleware(makeRequest("/api/chat"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("answers 401 for protected api routes with an invalid token", async () => {
    const response = await middleware(
      makeRequest("/api/conversations", "not-a-jwt"),
    );
    expect(response.status).toBe(401);
  });

  it("forwards identity headers for protected api routes with a valid token", async () => {
    const response = await middleware(
      makeRequest("/api/export-pdf", await makeToken("admin", "user-9")),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-user-id")).toBe("user-9");
    expect(response.headers.get("x-user-role")).toBe("admin");
  });

  it("guards the authenticated subset of /api/auth routes", async () => {
    for (const path of [
      "/api/auth/me",
      "/api/auth/profile",
      "/api/auth/role",
    ]) {
      const response = await middleware(makeRequest(path));
      expect(response.status).toBe(401);
    }
  });

  it("leaves the public /api/auth routes untouched", async () => {
    for (const path of ["/api/auth/login", "/api/auth/register"]) {
      const response = await middleware(makeRequest(path));
      expect(response.status).toBe(200);
      expect(response.headers.get("x-user-id")).toBeNull();
    }
  });
});

describe("middleware on public routes", () => {
  it("passes through public pages and unknown paths", async () => {
    for (const path of [
      "/",
      "/about",
      "/pricing",
      "/contact",
      "/some/unknown/page",
    ]) {
      const response = await middleware(makeRequest(path));
      expect(response.headers.get("location")).toBeNull();
      expect(response.status).toBe(200);
    }
  });
});

describe("config", () => {
  it("matches page requests but skips next internals and static images", () => {
    const matcher = new RegExp(
      config.matcher[0].replace(/^\/\(/, "^(").replace(/\)$/, ")$"),
    );

    expect(matcher.test("dashboard")).toBe(true);
    expect(matcher.test("_next/static/chunk.js")).toBe(false);
    expect(matcher.test("logo.svg")).toBe(false);
    expect(matcher.test("favicon.ico")).toBe(false);
  });
});
