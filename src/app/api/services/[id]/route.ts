import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { badRequest, conflict, notFound, withErrorHandling } from "@/lib/api/response";
import { count } from "drizzle-orm";
import { moneyAmount } from "@/lib/crm/schedule";

type Context = { params: Promise<{ id: string }> };

function parsePatch(data: Record<string, unknown>) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) return { error: "Нужно название услуги" as const };
  const price = Number(String(data.price ?? "").replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(price) || price < 0) return { error: "Неверная цена" as const };
  const duration = Number(data.duration);
  if (!Number.isInteger(duration) || duration <= 0 || duration > 24 * 60) {
    return { error: "Длительность должна быть в минутах" as const };
  }
  return {
    value: {
      name: name.slice(0, 200),
      description:
        typeof data.description === "string" && data.description.trim()
          ? data.description.trim().slice(0, 2000)
          : null,
      price: price.toFixed(2),
      duration,
      category:
        typeof data.category === "string" && data.category.trim()
          ? data.category.trim().slice(0, 120)
          : null,
      isActive: data.isActive === false ? "false" : "true",
      updatedAt: new Date(),
    },
  };
}

async function ownerId() {
  const { session, response } = await requireRole(MANAGER_ROLES);
  if (response) return { response };
  return { id: session.sub };
}

function toItem(
  row: typeof services.$inferSelect,
  appointmentsCount: number,
) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: String(moneyAmount(row.price)),
    duration: row.duration,
    category: row.category ?? "",
    imageUrl: row.imageUrl,
    isActive: row.isActive !== "false",
    appointmentsCount,
  };
}

export const PATCH = withErrorHandling(
  "Ошибка обновления услуги",
  async (request: NextRequest, context: Context) => {
    const auth = await ownerId();
    if (auth.response) return auth.response;
    const { id } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const parsed = parsePatch(body as Record<string, unknown>);
    if ("error" in parsed) return badRequest(parsed.error ?? "Неверные данные");
    const [row] = await db
      .update(services)
      .set(parsed.value)
      .where(and(eq(services.id, id), eq(services.cosmetologistId, auth.id)))
      .returning();
    if (!row) return notFound("Услуга не найдена");
    const [used] = await db
      .select({ value: count() })
      .from(appointments)
      .where(eq(appointments.serviceId, id));
    return NextResponse.json({ service: toItem(row, used?.value ?? 0) });
  },
);

export const DELETE = withErrorHandling(
  "Ошибка удаления услуги",
  async (_request: NextRequest, context: Context) => {
    const auth = await ownerId();
    if (auth.response) return auth.response;
    const { id } = await context.params;
    const [used] = await db
      .select({ value: count() })
      .from(appointments)
      .where(eq(appointments.serviceId, id));
    if ((used?.value ?? 0) > 0) {
      return conflict("У услуги есть записи, удаление отменено");
    }
    const rows = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.cosmetologistId, auth.id)))
      .returning({ id: services.id });
    if (rows.length === 0) return notFound("Услуга не найдена");
    return NextResponse.json({ ok: true });
  },
);
