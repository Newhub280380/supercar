import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const listRows = vi.fn<() => Array<{ createdAt: Date }>>();
const countRows = vi.fn<() => Array<{ value: number }>>();

const insertReturning = vi.fn<
  () => Array<{ id: string; contact: string; incoming: string }>
>();
type RoleHandler = (
  session: { sub: string; role: string },
  request: NextRequest,
) => Promise<Response> | Response;
type RateHandler = (request: NextRequest) => Promise<Response> | Response;

vi.mock("drizzle-orm", () => ({
  count: vi.fn(() => "count_expr"),
  desc: vi.fn((value) => value),
  lt: vi.fn((left, right) => ({ left, right })),
}));

vi.mock("@/db/schema", () => ({
  leads: { createdAt: "created_at" },
  leadSourceEnum: {
    enumValues: ["whatsapp", "instagram", "telegram", "site", "other"],
  },
}));

vi.mock("@/lib/auth", () => ({
  MANAGER_ROLES: ["admin"],
}));

vi.mock("@/lib/api/handlers", () => ({
  withRole: (
    _label: string,
    _roles: readonly string[],
    handler: RoleHandler,
  ) => {
    return (request: NextRequest) =>
      handler({ sub: "u-1", role: "admin" }, request);
  },
  withRateLimit: (_scope: string, _max: number, handler: RateHandler) => {
    return (request: NextRequest) => handler(request);
  },
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn((selection?: unknown) => {
      if (selection) {
        return {
          from: vi.fn(async () => countRows()),
        };
      }

      return {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(async () => listRows()),
            })),
          })),
        })),
      };
    }),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(async () => insertReturning()),
      })),
    })),
  },
}));

import { GET, POST } from "./route";

const previousIngestToken = process.env.LEADS_INGEST_TOKEN;

beforeEach(() => {
  listRows.mockReturnValue([]);
  countRows.mockReturnValue([{ value: 0 }]);
  insertReturning.mockReturnValue([
    { id: "lead-1", contact: "+1000000000", incoming: "hello" },
  ]);
});

afterEach(() => {
  if (previousIngestToken === undefined) {
    delete process.env.LEADS_INGEST_TOKEN;
  } else {
    process.env.LEADS_INGEST_TOKEN = previousIngestToken;
  }
});

describe("GET /api/leads", () => {
  it("returns stable pagination payload for an empty leads table", async () => {
    const response = await GET(new NextRequest("https://example.com/api/leads"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      leads: [],
      total: 0,
      nextCursor: null,
    });
  });
});

describe("POST /api/leads", () => {
  it("keeps ingest disabled when LEADS_INGEST_TOKEN is missing", async () => {
    delete process.env.LEADS_INGEST_TOKEN;

    const response = await POST(
      new NextRequest("https://example.com/api/leads", {
        method: "POST",
        body: JSON.stringify({ contact: "+1000000000", incoming: "hello" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Приём лидов не настроен",
    });
  });

  it("returns 400 for invalid or non-object JSON payloads", async () => {
    process.env.LEADS_INGEST_TOKEN = "token-123";
    const authHeader = "Bearer " + process.env.LEADS_INGEST_TOKEN;

    const invalidJson = await POST(
      new NextRequest("https://example.com/api/leads", {
        method: "POST",
        body: "{",
        headers: {
          authorization: authHeader,
          "content-type": "application/json",
        },
      }),
    );

    expect(invalidJson.status).toBe(400);
    await expect(invalidJson.json()).resolves.toEqual({
      error: "Ожидается JSON-объект",
    });

    const jsonArray = await POST(
      new NextRequest("https://example.com/api/leads", {
        method: "POST",
        body: JSON.stringify([]),
        headers: {
          authorization: authHeader,
          "content-type": "application/json",
        },
      }),
    );

    expect(jsonArray.status).toBe(400);
    await expect(jsonArray.json()).resolves.toEqual({
      error: "Ожидается JSON-объект",
    });
  });
});
