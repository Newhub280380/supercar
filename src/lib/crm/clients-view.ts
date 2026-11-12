import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, clients, services, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { toLocalIsoDate } from "@/lib/format";
import { moneyAmount, serializeAppointment, type AppointmentView } from "./schedule";
import crypto from "crypto";

export type SalonClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  skinType: "normal" | "dry" | "oily" | "combination" | "sensitive" | null;
  allergies: string | null;
  notes: string | null;
  totalVisits: number;
  totalSpent: string;
  lastVisit: string;
  createdAt: string;
  status: "new" | "returning" | "vip";
};

type ClientRow = {
  id: string;
  userId: string;
  notes: string | null;
  skinType: SalonClient["skinType"];
  allergies: string | null;
  createdAt: Date;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
};

function statusFor(visits: number): SalonClient["status"] {
  if (visits <= 0) return "new";
  if (visits >= 8) return "vip";
  return "returning";
}

export async function listSalonClients(ownerId: string): Promise<SalonClient[]> {
  const rows = await db
    .select({
      id: clients.id,
      userId: clients.userId,
      notes: clients.notes,
      skinType: clients.skinType,
      allergies: clients.allergies,
      createdAt: clients.createdAt,
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatar: users.avatar,
    })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .where(eq(clients.cosmetologistId, ownerId))
    .orderBy(desc(clients.createdAt));

  const visits = await db
    .select({
      clientId: appointments.clientId,
      date: appointments.date,
      status: appointments.status,
      price: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.cosmetologistId, ownerId));

  return rows.map((row) => toClient(row, visits));
}

function toClient(
  row: ClientRow,
  visits: Array<{
    clientId: string;
    date: Date;
    status: string;
    price: string;
  }>,
): SalonClient {
  const own = visits.filter((visit) => visit.clientId === row.userId);
  const completed = own.filter((visit) => visit.status === "completed");
  const spent = completed.reduce((sum, visit) => sum + moneyAmount(visit.price), 0);
  const last = own.reduce<Date | null>((acc, visit) => {
    if (!acc || visit.date > acc) return visit.date;
    return acc;
  }, null);
  return {
    id: row.id,
    name: row.name || "Без имени",
    email: row.email,
    phone: row.phone || "",
    avatar: row.avatar,
    skinType: row.skinType,
    allergies: row.allergies,
    notes: row.notes,
    totalVisits: completed.length,
    totalSpent: spent.toLocaleString("ru-RU"),
    lastVisit: last ? toLocalIsoDate(last) : "",
    createdAt: row.createdAt.toISOString(),
    status: statusFor(completed.length),
  };
}

export async function getSalonClient(
  ownerId: string,
  id: string,
): Promise<{ client: SalonClient; appointments: AppointmentView[] } | null> {
  const [row] = await db
    .select({
      id: clients.id,
      userId: clients.userId,
      notes: clients.notes,
      skinType: clients.skinType,
      allergies: clients.allergies,
      createdAt: clients.createdAt,
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatar: users.avatar,
    })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .where(and(eq(clients.id, id), eq(clients.cosmetologistId, ownerId)))
    .limit(1);
  if (!row) return null;

  const visitRows = await db
    .select({
      clientId: appointments.clientId,
      date: appointments.date,
      status: appointments.status,
      price: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.cosmetologistId, ownerId),
        eq(appointments.clientId, row.userId),
      ),
    );

  const detailed = await db
    .select({
      id: appointments.id,
      date: appointments.date,
      endTime: appointments.endTime,
      status: appointments.status,
      notes: appointments.notes,
      serviceName: services.name,
      price: services.price,
      duration: services.duration,
      clientName: users.name,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(users, eq(appointments.clientId, users.id))
    .where(
      and(
        eq(appointments.cosmetologistId, ownerId),
        eq(appointments.clientId, row.userId),
      ),
    );

  return {
    client: toClient(row, visitRows),
    appointments: detailed.map(serializeAppointment),
  };
}

const SKIN = ["normal", "dry", "oily", "combination", "sensitive"] as const;

export async function createSalonClient(
  ownerId: string,
  input: {
    name: string;
    email: string;
    phone: string | null;
    skinType: (typeof SKIN)[number] | null;
    notes: string | null;
    allergies: string | null;
  },
): Promise<SalonClient> {
  const passwordHash = await hashPassword(crypto.randomUUID());
  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      name: input.name,
      role: "client",
      phone: input.phone,
    })
    .returning();
  const [client] = await db
    .insert(clients)
    .values({
      userId: user.id,
      cosmetologistId: ownerId,
      notes: input.notes,
      skinType: input.skinType,
      allergies: input.allergies,
    })
    .returning();
  return {
    id: client.id,
    name: input.name,
    email: input.email,
    phone: input.phone || "",
    avatar: null,
    skinType: input.skinType,
    allergies: input.allergies,
    notes: input.notes,
    totalVisits: 0,
    totalSpent: "0",
    lastVisit: "",
    createdAt: client.createdAt.toISOString(),
    status: "new",
  };
}

export function parseSalonClientBody(data: Record<string, unknown>):
  | {
      ok: true;
      value: {
        name: string;
        email: string;
        phone: string | null;
        skinType: (typeof SKIN)[number] | null;
        notes: string | null;
        allergies: string | null;
      };
    }
  | { ok: false; error: string } {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (name.length < 2) return { ok: false, error: "Нужно имя" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Нужен корректный email" };
  }
  const skin = data.skinType;
  if (skin != null && skin !== "" && (typeof skin !== "string" || !SKIN.includes(skin as (typeof SKIN)[number]))) {
    return { ok: false, error: "Неверный тип кожи" };
  }
  const text = (key: string) =>
    typeof data[key] === "string" && data[key].trim()
      ? String(data[key]).trim().slice(0, 2000)
      : null;
  return {
    ok: true,
    value: {
      name: name.slice(0, 200),
      email,
      phone: text("phone"),
      skinType: skin && typeof skin === "string" ? (skin as (typeof SKIN)[number]) : null,
      notes: text("notes"),
      allergies: text("allergies"),
    },
  };
}
