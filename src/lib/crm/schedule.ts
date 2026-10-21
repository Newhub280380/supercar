import { toLocalIsoDate } from "@/lib/format";

export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function moneyAmount(value: string | number | null | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

export type AppointmentView = {
  id: string;
  clientName: string;
  clientAvatar: null;
  service: string;
  servicePrice: string;
  date: string;
  time: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  skinType: null;
};

export function serializeAppointment(row: {
  id: string;
  date: Date;
  endTime: Date | null;
  status: AppointmentView["status"];
  notes: string | null;
  serviceName: string;
  price: string;
  duration: number;
  clientName: string | null;
}): AppointmentView {
  const end = row.endTime ?? new Date(row.date.getTime() + row.duration * 60_000);
  return {
    id: row.id,
    clientName: row.clientName || "Без имени",
    clientAvatar: null,
    service: row.serviceName,
    servicePrice: String(moneyAmount(row.price)),
    date: toLocalIsoDate(row.date),
    time: formatClock(row.date),
    endTime: formatClock(end),
    status: row.status,
    notes: row.notes,
    skinType: null,
  };
}
