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

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
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
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
          <User className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Клиент не найден</p>
        <Link href="/dashboard/clients">
          <Button variant="outline" size="sm" className="mt-3">
            <ArrowLeft className="size-4" />
            К списку клиентов
          </Button>
        </Link>
      </div>
    );
  }

  const clientAppts = getClientAppointments(clientId);
  const initials = client.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const statusStyle = STATUS_STYLES[client.status];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Назад к клиентам
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar size="lg" className="size-16">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-xl font-bold">{client.name}</h1>
                <Badge variant="outline" className={cn("text-xs", statusStyle)}>
                  {client.status === "vip" && <Star className="size-3 fill-current" />}
                  {client.status === "vip" ? "VIP" : client.status === "new" ? "Новый" : "Повторный"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />{client.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />{client.phone}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {client.skinType ? SKIN_TYPE_LABELS[client.skinType] : "Не указан"}
                </Badge>
                {client.allergies && client.allergies !== "Нет" && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    <AlertTriangle className="size-3 mr-1" />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="size-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold">{client.totalVisits}</div>
            <div className="text-xs text-muted-foreground">Всего визитов</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-chart-2/20">
                <Star className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">₽{client.totalSpent}</div>
            <div className="text-xs text-muted-foreground">Общие расходы</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sage/20">
                <Clock className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {new Date(client.lastVisit).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
            </div>
            <div className="text-xs text-muted-foreground">Последний визит</div>
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
              <p className="py-8 text-center text-sm text-muted-foreground">
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
                        className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                      >
                        <div className={cn(
                          "flex size-10 items-center justify-center rounded-xl shrink-0",
                          statusColor,
                        )}>
                          <Calendar className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{apt.service}</span>
                            <Badge variant="outline" className={cn("text-[10px]", statusColor)}>
                              {APPOINTMENT_STATUS_LABELS[apt.status]}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(apt.date).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {" · "}{apt.time}–{apt.endTime}
                          </div>
                          {apt.notes && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
                              <MessageSquare className="size-3" />
                              {apt.notes}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">₽{apt.servicePrice}</span>
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
                <span className="font-medium">{client.skinType ? SKIN_TYPE_LABELS[client.skinType] : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Аллергии</span>
                <span className="font-medium">{client.allergies || "Нет"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Регистрация</span>
                <span className="font-medium">
                  {new Date(client.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
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
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
