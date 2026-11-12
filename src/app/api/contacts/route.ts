import { NextResponse, type NextRequest } from "next/server";
import { withRole } from "@/lib/api/handlers";
import { badRequest } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import {
  createContact,
  listContacts,
  readContactBody,
} from "@/lib/crm/contact-store";
import { isContactStatus } from "@/lib/crm/contacts";

export const GET = withRole(
  "Ошибка загрузки контактов",
  MANAGER_ROLES,
  async (session, request) => {
    const q = request.nextUrl.searchParams.get("q");
    const statusParam = request.nextUrl.searchParams.get("status");
    if (statusParam && !isContactStatus(statusParam)) {
      return badRequest("Неверный статус");
    }
    const contacts = await listContacts(session.sub, {
      q,
      status: statusParam && isContactStatus(statusParam) ? statusParam : null,
    });
    return NextResponse.json({ contacts });
  },
);

export const POST = withRole(
  "Ошибка создания контакта",
  MANAGER_ROLES,
  async (session, request: NextRequest) => {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const parsed = readContactBody(body as Record<string, unknown>);
    if (!parsed.ok) return badRequest(parsed.error);
    const contact = await createContact(session.sub, parsed.value);
    return NextResponse.json({ contact }, { status: 201 });
  },
);
