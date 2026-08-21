"use client";

import { useState } from "react";
import {
  Search,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  FileText,
} from "lucide-react";
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
import { seoPagesData, type SeoPageItem } from "@/lib/promotion-mock-data";
import { auditSeoPages } from "@/lib/promotion-utils";
import { downloadText } from "@/lib/download";

const SEVERITY_CONFIG = {
  error: {
    icon: AlertCircle,
    label: "Ошибка",
    className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
    badgeClass:
      "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    label: "Предупреждение",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    badgeClass:
      "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
  },
  info: {
    icon: Info,
    label: "Инфо",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
    badgeClass:
      "border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-400",
  },
};

export default function SeoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const filteredPages = seoPagesData.filter(
    (page) =>
      page.pageUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.metaTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const auditResult = auditSeoPages(seoPagesData);

  const download = async (
    endpoint: string,
    filename: string,
    mimeType: string,
  ) => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Failed to download ${filename}: ${res.status}`);
      }
      downloadText(await res.text(), filename, mimeType);
      setDownloadError(null);
    } catch (err) {
      console.error(`Failed to download ${filename}:`, err);
      setDownloadError(`Не удалось скачать ${filename}`);
    }
  };

  const handleDownloadSitemap = () =>
    download("/api/seo/sitemap", "sitemap.xml", "application/xml");

  const handleDownloadRobots = () =>
    download("/api/robots.txt", "robots.txt", "text/plain");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск страниц..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadSitemap}>
            <Download className="size-4" />
            Sitemap.xml
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadRobots}>
            <Download className="size-4" />
            Robots.txt
          </Button>
          <Button size="sm" onClick={() => setShowAudit(!showAudit)}>
            <Search className="size-4" />
            {showAudit ? "Скрыть аудит" : "SEO-аудит"}
          </Button>
        </div>
      </div>

      {downloadError && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {downloadError}
        </div>
      )}

      {showAudit && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SEO-аудит</CardTitle>
                <CardDescription>
                  Проверка мета-тегов, заголовков и описаний
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                >
                  <CheckCircle2 className="size-3" />
                  {auditResult.passedCount} ок
                </Badge>
                <Badge
                  variant="outline"
                  className={SEVERITY_CONFIG.warning.badgeClass}
                >
                  <AlertTriangle className="size-3" />
                  {auditResult.warningCount} предупреждений
                </Badge>
                <Badge
                  variant="outline"
                  className={SEVERITY_CONFIG.error.badgeClass}
                >
                  <AlertCircle className="size-3" />
                  {auditResult.errorCount} ошибок
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3">
              <div className="text-3xl font-bold">{auditResult.score}</div>
              <div className="text-muted-foreground text-sm">
                из 100 баллов SEO-качества
              </div>
            </div>
            <div className="space-y-2">
              {auditResult.issues.map((issue, i) => {
                const config = SEVERITY_CONFIG[issue.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={i}
                    className="border-border/50 flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${config.className}`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {issue.pageUrl}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${config.badgeClass}`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-sm">
                        {issue.issue}
                      </div>
                      <div className="text-muted-foreground/70 mt-0.5 text-xs">
                        {issue.suggestion}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Мета-теги страниц</CardTitle>
          <CardDescription>
            Управление SEO мета-тегами для каждой страницы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPages.map((page) => (
              <SeoPageRow key={page.id} page={page} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SeoPageRow({ page }: { page: SeoPageItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-border/50 hover:bg-muted/20 rounded-lg border transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <FileText className="text-muted-foreground size-4 shrink-0" />
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{page.pageUrl}</span>
            {page.hasTitle ? (
              <Badge
                variant="outline"
                className="border-green-200 text-[10px] text-green-700 dark:border-green-800 dark:text-green-400"
              >
                Title ✓
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-red-200 text-[10px] text-red-700 dark:border-red-800 dark:text-red-400"
              >
                Title ✗
              </Badge>
            )}
            {page.hasDescription ? (
              <Badge
                variant="outline"
                className="border-green-200 text-[10px] text-green-700 dark:border-green-800 dark:text-green-400"
              >
                Desc ✓
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-red-200 text-[10px] text-red-700 dark:border-red-800 dark:text-red-400"
              >
                Desc ✗
              </Badge>
            )}
          </div>
          {page.metaTitle && (
            <div className="text-muted-foreground truncate text-xs">
              {page.metaTitle}
            </div>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-border/50 space-y-2 border-t p-3">
          <div>
            <div className="text-muted-foreground text-xs font-medium">
              Title ({page.metaTitle?.length || 0} символов)
            </div>
            <div className="bg-muted/50 mt-1 rounded-md p-2 text-sm">
              {page.metaTitle || (
                <span className="text-muted-foreground italic">
                  Не заполнено
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs font-medium">
              Description ({page.metaDescription?.length || 0} символов)
            </div>
            <div className="bg-muted/50 mt-1 rounded-md p-2 text-sm">
              {page.metaDescription || (
                <span className="text-muted-foreground italic">
                  Не заполнено
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs font-medium">
              Keywords
            </div>
            <div className="bg-muted/50 mt-1 rounded-md p-2 text-sm">
              {page.keywords || (
                <span className="text-muted-foreground italic">
                  Не заполнено
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
