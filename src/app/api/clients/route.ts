import { NextResponse, type NextRequest } from "next/server";
import { withRole } from "@/lib/api/handlers";
import { badRequest, conflict } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import { createSalonClient, listSalonClients, parseSalonClientBody } from "@/lib/crm/clients-view";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export const GET = withRole(
  "Ошибка загрузки клиентов",
  MANAGER_ROLES,
  async (session) => {
    const clients = await listSalonClients(session.sub);
    return NextResponse.json({ clients });
  },
);

export const POST = withRole(
  "Ошибка создания клиента",
  MANAGER_ROLES,
  async (session, request: NextRequest) => {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const parsed = parseSalonClientBody(body as Record<string, unknown>);
    if (!parsed.ok) return badRequest(parsed.error);
    try {
      const client = await createSalonClient(session.sub, parsed.value);
      return NextResponse.json({ client }, { status: 201 });
    } catch (error) {
      if (isUniqueViolation(error)) return conflict("Такой email уже есть");
      throw error;
    }
  },
);
