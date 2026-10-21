import { NextResponse, type NextRequest } from "next/server";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { badRequest, notFound, withErrorHandling } from "@/lib/api/response";
import {
  deleteContact,
  getContact,
  readContactBody,
  updateContact,
} from "@/lib/crm/contact-store";

type Context = { params: Promise<{ id: string }> };

async function ownerId(): Promise<
  { id: string; response?: never } | { id?: never; response: NextResponse }
> {
  const { session, response } = await requireRole(MANAGER_ROLES);
  if (response) return { response };
  return { id: session.sub };
}

export const GET = withErrorHandling(
  "Ошибка загрузки контакта",
  async (_request: NextRequest, context: Context) => {
    const auth = await ownerId();
    if (auth.response) return auth.response;
    const { id } = await context.params;
    const contact = await getContact(auth.id, id);
    if (!contact) return notFound("Контакт не найден");
    return NextResponse.json({ contact });
  },
);

export const PATCH = withErrorHandling(
  "Ошибка обновления контакта",
  async (request: NextRequest, context: Context) => {
    const auth = await ownerId();
    if (auth.response) return auth.response;
    const { id } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const parsed = readContactBody(body as Record<string, unknown>);
    if (!parsed.ok) return badRequest(parsed.error);
    const contact = await updateContact(auth.id, id, parsed.value);
    if (!contact) return notFound("Контакт не найден");
    return NextResponse.json({ contact });
  },
);

export const DELETE = withErrorHandling(
  "Ошибка удаления контакта",
  async (_request: NextRequest, context: Context) => {
    const auth = await ownerId();
    if (auth.response) return auth.response;
    const { id } = await context.params;
    const removed = await deleteContact(auth.id, id);
    if (!removed) return notFound("Контакт не найден");
    return NextResponse.json({ ok: true });
  },
);
