import { count, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import { withRole } from "@/lib/api/handlers";
import { badRequest } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import { moneyAmount } from "@/lib/crm/schedule";

function parseService(data: Record<string, unknown>) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) return { error: "Нужно название услуги" as const };
  const price = Number(String(data.price ?? "").replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(price) || price < 0) return { error: "Неверная цена" as const };
  const duration = Number(data.duration);
  if (!Number.isInteger(duration) || duration <= 0 || duration > 24 * 60) {
    return { error: "Длительность должна быть в минутах" as const };
  }
  const description =
    typeof data.description === "string" && data.description.trim()
      ? data.description.trim().slice(0, 2000)
      : null;
  const category =
    typeof data.category === "string" && data.category.trim()
      ? data.category.trim().slice(0, 120)
      : null;
  return {
    value: {
      name: name.slice(0, 200),
      description,
      price: price.toFixed(2),
      duration,
      category,
      isActive: data.isActive === false ? "false" : "true",
    },
  };
}

async function listFor(ownerId: string) {
  const [rows, counts] = await Promise.all([
    db
      .select()
      .from(services)
      .where(eq(services.cosmetologistId, ownerId)),
    db
      .select({ serviceId: appointments.serviceId, value: count() })
      .from(appointments)
      .where(eq(appointments.cosmetologistId, ownerId))
      .groupBy(appointments.serviceId),
  ]);
  const byService = new Map(counts.map((row) => [row.serviceId, row.value]));
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: String(moneyAmount(row.price)),
    duration: row.duration,
    category: row.category ?? "",
    imageUrl: row.imageUrl,
    isActive: row.isActive !== "false",
    appointmentsCount: byService.get(row.id) ?? 0,
  }));
}

export const GET = withRole(
  "Ошибка загрузки услуг",
  MANAGER_ROLES,
  async (session) => {
    return NextResponse.json({ services: await listFor(session.sub) });
  },
);

export const POST = withRole(
  "Ошибка создания услуги",
  MANAGER_ROLES,
  async (session, request: NextRequest) => {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Ожидается JSON");
    const parsed = parseService(body as Record<string, unknown>);
    if ("error" in parsed) return badRequest(parsed.error ?? "Неверные данные");
    const [row] = await db
      .insert(services)
      .values({ cosmetologistId: session.sub, ...parsed.value })
      .returning();
    return NextResponse.json(
      {
        service: {
          id: row.id,
          name: row.name,
          description: row.description,
          price: String(moneyAmount(row.price)),
          duration: row.duration,
          category: row.category ?? "",
          imageUrl: row.imageUrl,
          isActive: row.isActive !== "false",
          appointmentsCount: 0,
        },
      },
      { status: 201 },
    );
  },
);
