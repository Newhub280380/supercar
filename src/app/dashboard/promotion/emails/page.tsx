"use client";

import { useState } from "react";
import {
  Mail,
  Plus,
  Eye,
  MousePointer,
  Send,
  Clock,
  FileEdit,
  Search,
  Users,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  emailCampaignsData,
  subscriberListsData,
  subscribersData,
  EMAIL_STATUS_LABELS,
  type EmailCampaignItem,
} from "@/lib/promotion-mock-data";
import type { EmailCampaignStatus } from "@/types";
import { calculateEmailMetrics } from "@/lib/promotion-utils";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_COLORS: Record<EmailCampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300",
  scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  sending: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  sent: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export default function EmailsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaigns" | "lists" | "subscribers">("campaigns");

  const filteredCampaigns = emailCampaignsData.filter(
    (c) =>
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.listName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "campaigns" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("campaigns")}
          >
            <Mail className="size-4" />
            Рассылки
          </Button>
          <Button
            variant={activeTab === "lists" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("lists")}
          >
            <Users className="size-4" />
            Списки
          </Button>
          <Button
            variant={activeTab === "subscribers" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("subscribers")}
          >
            <BarChart3 className="size-4" />
            Подписчики
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            Новая рассылка
          </Button>
        </div>
      </div>

      {activeTab === "campaigns" && (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <EmailCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {activeTab === "lists" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {subscriberListsData.map((list) => (
            <Card key={list.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="size-5 text-primary" />
                  </div>
                  <Badge variant="outline">{list.subscriberCount} подп.</Badge>
                </div>
                <div className="mt-3 font-medium">{list.name}</div>
                <div className="text-xs text-muted-foreground">{list.description}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Создан: {new Date(list.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "subscribers" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {subscribersData.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {sub.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium">{sub.name}</div>
                    <div className="text-xs text-muted-foreground">{sub.email}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      sub.status === "active"
                        ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                        : sub.status === "unsubscribed"
                          ? "border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-400"
                          : "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
                    )}
                  >
                    {sub.status === "active" ? "Активен" : sub.status === "unsubscribed" ? "Отписан" : "Возврат"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая Email-рассылка</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Тема письма</label>
              <Input placeholder="Введите тему письма" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Список получателей</label>
              <select className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm">
                {subscriberListsData.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.subscriberCount})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Шаблон</label>
              <select className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm">
                <option value="">Без шаблона</option>
                <option value="seasonal">Сезонная акция</option>
                <option value="reminder">Напоминание</option>
                <option value="new-service">Новая услуга</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Содержимое</label>
              <textarea
                placeholder="HTML-содержимое письма..."
                className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm min-h-32"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Отмена
              </Button>
              <Button onClick={() => setShowCreate(false)}>
                <Send className="size-4" />
                Создать черновик
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmailCampaignCard({ campaign }: { campaign: EmailCampaignItem }) {
  const [showMetrics, setShowMetrics] = useState(false);
  const metrics = campaign.metrics
    ? calculateEmailMetrics(
        campaign.metrics.sent,
        campaign.metrics.opened,
        campaign.metrics.clicked,
        campaign.metrics.bounced,
      )
    : null;

  return (
    <div className="rounded-lg border border-border/50 transition-colors hover:bg-muted/20">
      <div className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="size-5 text-primary" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{campaign.subject}</span>
            <Badge variant="outline" className={cn("shrink-0 text-[10px]", STATUS_COLORS[campaign.status])}>
              {EMAIL_STATUS_LABELS[campaign.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{campaign.listName}</span>
            <span>{campaign.recipientCount} получателей</span>
            {campaign.sentAt && (
              <span className="flex items-center gap-1">
                <Send className="size-3" />
                {new Date(campaign.sentAt).toLocaleDateString("ru-RU")}
              </span>
            )}
            {campaign.scheduledAt && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {new Date(campaign.scheduledAt).toLocaleDateString("ru-RU")}
              </span>
            )}
          </div>
        </div>
        {campaign.metrics && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
          >
            <Eye className="size-4" />
            Статистика
          </Button>
        )}
        {campaign.status === "draft" && (
          <Button variant="ghost" size="sm">
            <FileEdit className="size-4" />
          </Button>
        )}
      </div>

      {showMetrics && metrics && (
        <div className="border-t border-border/50 bg-muted/20 p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Eye className="size-4 text-muted-foreground" />
                {metrics.openRate}%
              </div>
              <div className="text-xs text-muted-foreground">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <MousePointer className="size-4 text-muted-foreground" />
                {metrics.clickRate}%
              </div>
              <div className="text-xs text-muted-foreground">Click Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.ctr}%</div>
              <div className="text-xs text-muted-foreground">CTR</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{campaign.metrics!.bounced}</div>
              <div className="text-xs text-muted-foreground">Возвратов</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
