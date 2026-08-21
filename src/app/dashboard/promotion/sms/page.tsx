"use client";

import { useState } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  Clock,
  Search,
  Bell,
  Gift,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  smsCampaignsData,
  SMS_STATUS_LABELS,
  SMS_TYPE_LABELS,
  type SmsCampaignItem,
} from "@/lib/promotion-mock-data";
import type { SmsCampaignStatus } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

const STATUS_COLORS: Record<SmsCampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300",
  scheduled:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  sending: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  sent: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  notification: Bell,
  reminder: Clock,
  promotion: Gift,
};

const TYPE_COLORS: Record<string, string> = {
  notification: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  reminder:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  promotion: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400",
};

export default function SmsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filteredCampaigns = smsCampaignsData.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск SMS-кампаний..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Новая SMS
        </Button>
      </div>

      <div className="space-y-3">
        {filteredCampaigns.map((campaign) => (
          <SmsCampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая SMS-кампания</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название кампании</label>
              <Input
                placeholder="Например: Напоминание о записи"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Тип</label>
              <select className="border-input mt-1 w-full rounded-lg border bg-transparent px-2.5 py-2 text-sm">
                <option value="notification">Уведомление</option>
                <option value="reminder">Напоминание</option>
                <option value="promotion">Акция</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Текст SMS</label>
              <textarea
                placeholder="Используйте {name}, {service}, {time}, {url} как переменные..."
                className="border-input mt-1 min-h-24 w-full rounded-lg border bg-transparent px-2.5 py-2 text-sm"
              />
              <div className="text-muted-foreground mt-1 text-xs">
                Доступные переменные: {"{name}"}, {"{service}"}, {"{time}"},{" "}
                {"{url}"}, {"{phone}"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Запланировать</label>
              <Input type="datetime-local" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Отмена
              </Button>
              <Button onClick={() => setShowCreate(false)}>
                <Send className="size-4" />
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SmsCampaignCard({ campaign }: { campaign: SmsCampaignItem }) {
  const TypeIcon = TYPE_ICONS[campaign.type] || MessageSquare;
  const typeColor = TYPE_COLORS[campaign.type] || TYPE_COLORS.notification;

  return (
    <div className="border-border/50 hover:bg-muted/20 rounded-lg border p-4 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            typeColor,
          )}
        >
          <TypeIcon className="size-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {campaign.name}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px]",
                STATUS_COLORS[campaign.status],
              )}
            >
              {SMS_STATUS_LABELS[campaign.status]}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {SMS_TYPE_LABELS[campaign.type]}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-0.5 truncate text-xs">
            {campaign.content}
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
            <span>{campaign.recipientCount} получателей</span>
            {campaign.sentAt && (
              <span className="flex items-center gap-1">
                <CheckCircle className="size-3" />
                {formatDate(campaign.sentAt)}
              </span>
            )}
            {campaign.scheduledAt && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDate(campaign.scheduledAt)}
              </span>
            )}
          </div>
        </div>
        {campaign.metrics && (
          <div className="flex shrink-0 items-center gap-3 text-center">
            <div>
              <div className="text-sm font-bold">{campaign.metrics.sent}</div>
              <div className="text-muted-foreground text-[10px]">
                Отправлено
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                {campaign.metrics.delivered}
              </div>
              <div className="text-muted-foreground text-[10px]">
                Доставлено
              </div>
            </div>
            {campaign.metrics.failed > 0 && (
              <div>
                <div className="text-sm font-bold text-red-600 dark:text-red-400">
                  {campaign.metrics.failed}
                </div>
                <div className="text-muted-foreground text-[10px]">Ошибок</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
