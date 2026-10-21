import { NextResponse, type NextRequest } from "next/server";
import { withRole } from "@/lib/api/handlers";
import { badRequest } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import { importContactsCsv } from "@/lib/crm/contact-store";

const MAX_BYTES = 2_000_000;

async function readCsv(request: NextRequest): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return null;
    if (file.size > MAX_BYTES) return null;
    return file.text();
  }
  if (contentType.includes("application/json")) {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return null;
    const csv = (body as { csv?: unknown }).csv;
    return typeof csv === "string" ? csv : null;
  }
  const text = await request.text();
  return text || null;
}

export const POST = withRole(
  "Ошибка импорта контактов",
  MANAGER_ROLES,
  async (session, request) => {
    const csv = await readCsv(request);
    if (!csv || !csv.trim()) return badRequest("Нужен CSV-файл или поле csv");
    if (csv.length > MAX_BYTES) return badRequest("Файл слишком большой");
    const result = await importContactsCsv(session.sub, csv);
    return NextResponse.json(result);
  },
);
