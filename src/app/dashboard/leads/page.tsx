"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";

type Lead = {
  id: string;
  source: string;
  contact: string;
  name: string | null;
  incoming: string;
  draft: string | null;
  escalate: boolean;
  reason: string | null;
  status: string;
  campaign: string | null;
  createdAt: string;
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  site: "Сайт",
  other: "Другое",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  in_progress: "В работе",
  qualified: "Квалифицирован",
  won: "Продажа",
  lost: "Потерян",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leads")
      .then(async (res) => {
        const data: { leads?: Lead[]; error?: string } = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Не удалось загрузить лиды");
        } else {
          setLeads(data.leads ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить лиды");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.contact.toLowerCase().includes(q) ||
        (l.name ?? "").toLowerCase().includes(q) ||
        l.incoming.toLowerCase().includes(q),
    );
  }, [leads, search]);

  const escalated = leads.filter((l) => l.escalate).length;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Лиды</h1>
          <p className="text-muted-foreground text-sm">
            Входящие обращения из мессенджеров с черновиком ответа агента
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Всего: {leads.length}</Badge>
          {escalated > 0 && (
            <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              Нужен ответ: {escalated}
            </Badge>
          )}
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по номеру, имени или тексту"
          className="pl-9"
        />
      </div>

      {loading && <p className="text-muted-foreground text-sm">Загрузка…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-sm">
            <Inbox className="size-6" />
            Пока нет лидов
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="flex flex-col gap-3 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{lead.name || lead.contact}</span>
                <Badge variant="secondary">
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </Badge>
                <Badge variant="outline">
                  {STATUS_LABELS[lead.status] ?? lead.status}
                </Badge>
                {lead.campaign && (
                  <Badge variant="outline">{lead.campaign}</Badge>
                )}
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatDate(lead.createdAt)}
                </span>
              </div>

              <p className="text-sm">{lead.incoming}</p>

              {lead.draft && (
                <p
                  className={cn(
                    "border-border text-muted-foreground border-l-2 pl-3 text-sm",
                  )}
                >
                  {lead.draft}
                </p>
              )}

              {lead.escalate && (
                <p className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-3.5" />
                  {lead.reason || "Требуется ответ вручную"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
