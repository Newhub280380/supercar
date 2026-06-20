"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Phone,
  Mail,
  Download,
  UserPlus,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clientsData, SKIN_TYPE_LABELS } from "@/lib/mock-data";
import { exportClientsCsv } from "@/lib/csv-export";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  new: { label: "Новый", className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  returning: { label: "Повторный", className: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300" },
  vip: { label: "VIP", className: "bg-gold/20 text-foreground dark:bg-gold/30" },
};

const INITIALS_COLORS = [
  "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
];

function getInitialsColor(name: string): string {
  const idx = name.charCodeAt(0) % INITIALS_COLORS.length;
  return INITIALS_COLORS[idx];
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [skinFilter, setSkinFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filteredClients = useMemo(() => {
    let result = clientsData;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (skinFilter !== "all") {
      result = result.filter((c) => c.skinType === skinFilter);
    }
    return result;
  }, [search, statusFilter, skinFilter]);

  const handleExport = () => {
    const data = filteredClients.map((c) => ({
      "Имя": c.name,
      "Email": c.email,
      "Телефон": c.phone,
      "Тип кожи": c.skinType ? SKIN_TYPE_LABELS[c.skinType] : "—",
      "Статус": STATUS_STYLES[c.status].label,
      "Всего визитов": c.totalVisits,
      "Общая сумма": c.totalSpent,
      "Последний визит": c.lastVisit,
      "Аллергии": c.allergies || "—",
    }));
    exportClientsCsv(data, "clients");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Клиенты</h1>
          <p className="text-sm text-muted-foreground">
            {clientsData.length} клиентов · {filteredClients.length} показано
          </p>
        </div>
        <Button size="sm">
          <UserPlus className="size-4" />
          Добавить клиента
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-2 pt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени, email, телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="returning">Повторные</option>
            <option value="vip">VIP</option>
          </select>

          <select
            value={skinFilter}
            onChange={(e) => setSkinFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="all">Все типы кожи</option>
            {Object.entries(SKIN_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            Экспорт
          </Button>

          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <List className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {viewMode === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Клиент</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Контакты</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Тип кожи</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground hidden md:table-cell">Визиты</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground hidden lg:table-cell">Расходы</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground hidden md:table-cell">Последний визит</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </tbody>
            </table>
            {filteredClients.length === 0 && <EmptyResults />}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full">
              <EmptyResults />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClientRow({ client }: { client: (typeof clientsData)[0] }) {
  const initials = client.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const colorClass = getInitialsColor(client.name);
  const statusStyle = STATUS_STYLES[client.status];

  return (
    <tr className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-3 group">
          <Avatar size="sm">
            <AvatarImage src={client.avatar || undefined} />
            <AvatarFallback className={cn("text-xs font-semibold", colorClass)}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium group-hover:text-primary transition-colors">{client.name}</div>
            <div className="text-xs text-muted-foreground">{client.allergies !== "Нет" ? `Аллергии: ${client.allergies}` : "Без аллергий"}</div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="size-3" />{client.email}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="size-3" />{client.phone}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        {client.skinType ? (
          <Badge variant="outline" className="text-xs">{SKIN_TYPE_LABELS[client.skinType]}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={cn("text-[10px]", statusStyle.className)}>
          {client.status === "vip" && <Star className="size-2.5 fill-current" />}
          {statusStyle.label}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right font-medium hidden md:table-cell">{client.totalVisits}</td>
      <td className="px-4 py-3 text-right font-medium hidden lg:table-cell">₽{client.totalSpent}</td>
      <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
        {new Date(client.lastVisit).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
      </td>
    </tr>
  );
}

function ClientCard({ client }: { client: (typeof clientsData)[0] }) {
  const initials = client.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const colorClass = getInitialsColor(client.name);
  const statusStyle = STATUS_STYLES[client.status];

  return (
    <Link href={`/dashboard/clients/${client.id}`}>
      <Card className="transition-all hover:shadow-md group h-full">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={client.avatar || undefined} />
              <AvatarFallback className={cn("text-xs font-semibold", colorClass)}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate group-hover:text-primary transition-colors">{client.name}</span>
                <Badge variant="outline" className={cn("shrink-0 text-[10px]", statusStyle.className)}>
                  {client.status === "vip" && <Star className="size-2.5 fill-current" />}
                  {statusStyle.label}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-3" />
                <span className="truncate">{client.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-2">
            <div className="text-center">
              <div className="text-sm font-semibold">{client.totalVisits}</div>
              <div className="text-[10px] text-muted-foreground">Визиты</div>
            </div>
            <div className="text-center border-x border-border/50">
              <div className="text-sm font-semibold">₽{client.totalSpent}</div>
              <div className="text-[10px] text-muted-foreground">Расходы</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold">
                {client.skinType ? SKIN_TYPE_LABELS[client.skinType].slice(0, 4) : "—"}
              </div>
              <div className="text-[10px] text-muted-foreground">Кожа</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyResults() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">Клиенты не найдены</p>
    </div>
  );
}
