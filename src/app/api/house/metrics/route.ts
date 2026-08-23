import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  appointments,
  clients,
  emailCampaigns,
  services,
  smsCampaigns,
  subscriberLists,
  subscribers,
  utmCampaigns,
} from "@/db/schema";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";

/** Границы текущего и предыдущего месяца в UTC. */
function monthBounds(now: Date) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const prevStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0),
  );
  return { start, prevStart };
}

/** Сумма прайса услуг по завершённым записям за интервал. */
async function revenueBetween(
  cosmetologistId: string,
  from: Date,
  to: Date,
): Promise<number> {
  const [row] = await db
    .select({
      total: sql<string>`coalesce(sum(${services.price}), 0)`,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.cosmetologistId, cosmetologistId),
        eq(appointments.status, "completed"),
        gte(appointments.date, from),
        lt(appointments.date, to),
      ),
    );
  return Number(row?.total ?? 0);
}

/**
 * Живые показатели компании для комнат 3D-дома: клиенты, записи, выручка,
 * услуги и маркетинг считаются из базы по владельцу сессии.
 */
export const GET = withRole(
  "House metrics error",
  MANAGER_ROLES,
  async (session) => {
    const owner = session.sub;
    const now = new Date();
    const { start, prevStart } = monthBounds(now);

    const [
      clientRows,
      newClientRows,
      statusRows,
      upcomingRows,
      overdueRows,
      serviceRows,
      activeServiceRows,
      emailRows,
      smsRows,
      utmRows,
      subscriberRows,
      revenue,
      prevRevenue,
    ] = await Promise.all([
      db
        .select({ value: count() })
        .from(clients)
        .where(eq(clients.cosmetologistId, owner)),
      db
        .select({ value: count() })
        .from(clients)
        .where(
          and(eq(clients.cosmetologistId, owner), gte(clients.createdAt, start)),
        ),
      db
        .select({ status: appointments.status, value: count() })
        .from(appointments)
        .where(eq(appointments.cosmetologistId, owner))
        .groupBy(appointments.status),
      db
        .select({ value: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.cosmetologistId, owner),
            gte(appointments.date, now),
          ),
        ),
      db
        .select({ value: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.cosmetologistId, owner),
            eq(appointments.status, "pending"),
            lt(appointments.date, now),
          ),
        ),
      db
        .select({ value: count() })
        .from(services)
        .where(eq(services.cosmetologistId, owner)),
      db
        .select({ value: count() })
        .from(services)
        .where(
          and(
            eq(services.cosmetologistId, owner),
            eq(services.isActive, "true"),
          ),
        ),
      db
        .select({ value: count() })
        .from(emailCampaigns)
        .where(eq(emailCampaigns.userId, owner)),
      db
        .select({ value: count() })
        .from(smsCampaigns)
        .where(eq(smsCampaigns.userId, owner)),
      db
        .select({ value: count() })
        .from(utmCampaigns)
        .where(eq(utmCampaigns.userId, owner)),
      db
        .select({ value: count() })
        .from(subscribers)
        .innerJoin(subscriberLists, eq(subscribers.listId, subscriberLists.id))
        .where(eq(subscriberLists.userId, owner)),
      revenueBetween(owner, start, now),
      revenueBetween(owner, prevStart, start),
    ]);

    const byStatus = Object.fromEntries(
      statusRows.map((row) => [row.status, row.value]),
    );
    const completed = byStatus.completed ?? 0;
    const totalAppointments = statusRows.reduce(
      (sum, row) => sum + row.value,
      0,
    );

    return NextResponse.json({
      generatedAt: now.toISOString(),
      clients: {
        total: clientRows[0]?.value ?? 0,
        newThisMonth: newClientRows[0]?.value ?? 0,
      },
      appointments: {
        total: totalAppointments,
        pending: byStatus.pending ?? 0,
        confirmed: byStatus.confirmed ?? 0,
        completed,
        cancelled: byStatus.cancelled ?? 0,
        upcoming: upcomingRows[0]?.value ?? 0,
        overdue: overdueRows[0]?.value ?? 0,
      },
      revenue: {
        thisMonth: revenue,
        prevMonth: prevRevenue,
        avgTicket: completed ? Math.round(revenue / completed) : 0,
      },
      services: {
        total: serviceRows[0]?.value ?? 0,
        active: activeServiceRows[0]?.value ?? 0,
      },
      marketing: {
        emailCampaigns: emailRows[0]?.value ?? 0,
        smsCampaigns: smsRows[0]?.value ?? 0,
        utmCampaigns: utmRows[0]?.value ?? 0,
        subscribers: subscriberRows[0]?.value ?? 0,
      },
    });
  },
);
