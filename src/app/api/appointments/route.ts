import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, services, users } from "@/db/schema";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";
import { serializeAppointment } from "@/lib/crm/schedule";

export const GET = withRole(
  "Ошибка загрузки записей",
  MANAGER_ROLES,
  async (session) => {
    const rows = await db
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
      .where(eq(appointments.cosmetologistId, session.sub));

    const items = rows
      .map(serializeAppointment)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    return NextResponse.json({ appointments: items });
  },
);
