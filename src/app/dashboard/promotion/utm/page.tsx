"use client";

import { useState } from "react";
import { Link2, Plus, Copy, Check, ExternalLink, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  utmCampaignsData,
  type UtmCampaignItem,
} from "@/lib/promotion-mock-data";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatNumber } from "@/lib/format";

export default function UtmPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [landingUrl, setLandingUrl] = useState("");

  const [campaigns, setCampaigns] =
    useState<UtmCampaignItem[]>(utmCampaignsData);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.source.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const { copy, copiedKey: copiedId } = useCopyToClipboard();

  const handleCopyUrl = (id: string, url: string) => {
    void copy(url, id);
  };

  const generatedUrl =
    source && medium && campaign && landingUrl
      ? `https://example.com${landingUrl}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`
      : "";

  const resetForm = () => {
    setSource("");
    setMedium("");
    setCampaign("");
    setLandingUrl("");
    setCreateError(null);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/utm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, medium, campaign, landingUrl }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setCreateError(data?.error ?? "Не удалось создать UTM-метку");
        return;
      }
      setCampaigns((current) => [
        { ...data.campaign, name: campaign } as UtmCampaignItem,
        ...current,
      ]);
      setShowCreate(false);
      resetForm();
    } catch {
      setCreateError("Ошибка сети. Повторите попытку.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск UTM-кампаний..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Создать UTM
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Общие клики</CardTitle>
            <CardDescription>По всем UTM-кампаниям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(
                campaigns.reduce((acc, c) => acc + c.clickCount, 0),
              )}
            </div>
            <div className="text-muted-foreground text-xs">всего переходов</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Конверсии</CardTitle>
            <CardDescription>Из UTM-кампаний</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(
                campaigns.reduce((acc, c) => acc + c.conversionCount, 0),
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              целевых действий
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Средняя конверсия</CardTitle>
            <CardDescription>Клики → Целевые действия</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const totalClicks = campaigns.reduce(
                (acc, c) => acc + c.clickCount,
                0,
              );
              const totalConversions = campaigns.reduce(
                (acc, c) => acc + c.conversionCount,
                0,
              );
              const rate =
                totalClicks > 0
                  ? ((totalConversions / totalClicks) * 100).toFixed(1)
                  : "0";
              return (
                <>
                  <div className="text-3xl font-bold">{rate}%</div>
                  <div className="text-muted-foreground text-xs">конверсия</div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>UTM-кампании</CardTitle>
          <CardDescription>
            Управление отслеживанием источников трафика
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCampaigns.map((utm) => (
              <UtmCampaignCard
                key={utm.id}
                campaign={utm}
                copiedId={copiedId}
                onCopy={handleCopyUrl}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать UTM-метку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название кампании</label>
              <Input
                placeholder="Например: Instagram весна 2026"
                className="mt-1"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Источник (source)</label>
                <Input
                  placeholder="instagram, google, vk..."
                  className="mt-1"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Канал (medium)</label>
                <Input
                  placeholder="social, cpc, email..."
                  className="mt-1"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Посадочный URL</label>
              <Input
                placeholder="/pricing или /services/biorevitalization"
                className="mt-1"
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
              />
            </div>
            {createError && (
              <p className="text-destructive text-sm">{createError}</p>
            )}
            {generatedUrl && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Предпросмотр URL
                </div>
                <div className="mt-1 font-mono text-xs break-all">
                  {generatedUrl}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
              >
                Отмена
              </Button>
              <Button
                disabled={!generatedUrl || isCreating}
                onClick={() => void handleCreate()}
              >
                <Link2 className="size-4" />
                {isCreating ? "Создание..." : "Создать UTM"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UtmCampaignCard({
  campaign,
  copiedId,
  onCopy,
}: {
  campaign: UtmCampaignItem;
  copiedId: string | null;
  onCopy: (id: string, url: string) => void;
}) {
  return (
    <div className="border-border/50 hover:bg-muted/20 rounded-lg border p-4 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {campaign.name}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {campaign.source}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {campaign.medium}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {campaign.campaign}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
            <ExternalLink className="size-3" />
            <span className="truncate">{campaign.landingUrl}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onCopy(campaign.id, campaign.generatedUrl)}
        >
          {copiedId === campaign.id ? (
            <Check className="size-4 text-green-600" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div>
          <div className="text-lg font-bold">{campaign.clickCount}</div>
          <div className="text-muted-foreground text-[10px]">кликов</div>
        </div>
        <div>
          <div className="text-lg font-bold">{campaign.conversionCount}</div>
          <div className="text-muted-foreground text-[10px]">конверсий</div>
        </div>
        <div>
          <div className="text-lg font-bold">
            {campaign.clickCount > 0
              ? (
                  (campaign.conversionCount / campaign.clickCount) *
                  100
                ).toFixed(1)
              : "0"}
            %
          </div>
          <div className="text-muted-foreground text-[10px]">конверсия</div>
        </div>
      </div>
    </div>
  );
}
