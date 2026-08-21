"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Star,
  Clock,
  AlertTriangle,
  MessageSquare,
  Edit,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  clientsData,
  getClientAppointments,
  SKIN_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/mock-data";
import type { AppointmentStatus } from "@/types";
import { formatDate } from "@/lib/format";

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  confirmed:
    "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  completed: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  returning: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  vip: "bg-gold/20 text-foreground dark:bg-gold/30",
};

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const client = clientsData.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
          <User className="text-muted-foreground size-6" />
        </div>
        <p className="text-sm font-medium">Клиент не найден</p>
        <Link href="/dashboard/clients">
          <Button variant="outline" size="sm" className="mt-3">
            <ArrowLeft className="size-4" />К списку клиентов
          </Button>
        </Link>
      </div>
    );
  }

  const clientAppts = getClientAppointments(clientId);
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  const statusStyle = STATUS_STYLES[client.status];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Link
          href="/dashboard/clients"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Назад к клиентам
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar size="lg" className="size-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-xl font-bold">
                  {client.name}
                </h1>
                <Badge variant="outline" className={cn("text-xs", statusStyle)}>
                  {client.status === "vip" && (
                    <Star className="size-3 fill-current" />
                  )}
                  {client.status === "vip"
                    ? "VIP"
                    : client.status === "new"
                      ? "Новый"
                      : "Повторный"}
                </Badge>
              </div>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {client.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {client.phone}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {client.skinType
                    ? SKIN_TYPE_LABELS[client.skinType]
                    : "Не указан"}
                </Badge>
                {client.allergies && client.allergies !== "Нет" && (
                  <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20"
                  >
                    <AlertTriangle className="mr-1 size-3" />
                    {client.allergies}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Button variant="outline" size="sm">
                <Edit className="size-3.5" />
                Редактировать
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mb-2 flex items-center justify-center">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <Calendar className="text-primary size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{client.totalVisits}</div>
            <div className="text-muted-foreground text-xs">Всего визитов</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mb-2 flex items-center justify-center">
              <div className="bg-chart-2/20 flex size-10 items-center justify-center rounded-xl">
                <Star className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">₽{client.totalSpent}</div>
            <div className="text-muted-foreground text-xs">Общие расходы</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mb-2 flex items-center justify-center">
              <div className="bg-sage/20 flex size-10 items-center justify-center rounded-xl">
                <Clock className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {formatDate(client.lastVisit, "dayMonth")}
            </div>
            <div className="text-muted-foreground text-xs">Последний визит</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>История процедур</CardTitle>
            <CardDescription>{clientAppts.length} записей</CardDescription>
          </CardHeader>
          <CardContent>
            {clientAppts.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Нет записей у этого клиента
              </p>
            ) : (
              <div className="space-y-2">
                {clientAppts
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((apt) => {
                    const statusColor = STATUS_COLORS[apt.status];
                    return (
                      <div
                        key={apt.id}
                        className="border-border/50 hover:bg-muted/30 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            statusColor,
                          )}
                        >
                          <Calendar className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              {apt.service}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn("text-[10px]", statusColor)}
                            >
                              {APPOINTMENT_STATUS_LABELS[apt.status]}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {formatDate(apt.date, "long")}
                            {" · "}
                            {apt.time}–{apt.endTime}
                          </div>
                          {apt.notes && (
                            <div className="text-muted-foreground/70 mt-1 flex items-center gap-1 text-xs">
                              <MessageSquare className="size-3" />
                              {apt.notes}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                          ₽{apt.servicePrice}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тип кожи</span>
                <span className="font-medium">
                  {client.skinType ? SKIN_TYPE_LABELS[client.skinType] : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Аллергии</span>
                <span className="font-medium">{client.allergies || "Нет"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Регистрация</span>
                <span className="font-medium">
                  {formatDate(client.createdAt, "dayMonthYear")}
                </span>
              </div>
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Заметки</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
