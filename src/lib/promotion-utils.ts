export function buildUtmUrl(
  baseUrl: string,
  params: {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
  },
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", params.source);
  url.searchParams.set("utm_medium", params.medium);
  url.searchParams.set("utm_campaign", params.campaign);
  if (params.term) url.searchParams.set("utm_term", params.term);
  if (params.content) url.searchParams.set("utm_content", params.content);
  return url.toString();
}

export function parseUtmParams(urlStr: string): Record<string, string> | null {
  try {
    const url = new URL(urlStr);
    const params: Record<string, string> = {};
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    for (const key of utmKeys) {
      const value = url.searchParams.get(key);
      if (value) params[key] = value;
    }
    return Object.keys(params).length > 0 ? params : null;
  } catch {
    return null;
  }
}

export interface SeoAuditIssue {
  pageUrl: string;
  issue: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
}

export interface SeoAuditResult {
  totalPages: number;
  issues: SeoAuditIssue[];
  score: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
}

export function auditSeoPages(
  pages: Array<{
    pageUrl: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    titleLength: number;
    descriptionLength: number;
  }>,
): SeoAuditResult {
  const issues: SeoAuditIssue[] = [];

  for (const page of pages) {
    if (!page.metaTitle) {
      issues.push({
        pageUrl: page.pageUrl,
        issue: "Отсутствует meta title",
        severity: "error",
        suggestion: "Добавьте уникальный meta title длиной 50-60 символов",
      });
    } else {
      if (page.titleLength < 30) {
        issues.push({
          pageUrl: page.pageUrl,
          issue: "Meta title слишком короткий",
          severity: "warning",
          suggestion: "Рекомендуемая длина title: 50-60 символов",
        });
      }
      if (page.titleLength > 70) {
        issues.push({
          pageUrl: page.pageUrl,
          issue: "Meta title слишком длинный",
          severity: "warning",
          suggestion: "Сократите title до 60 символов, чтобы он полностью отображался в поиске",
        });
      }
    }

    if (!page.metaDescription) {
      issues.push({
        pageUrl: page.pageUrl,
        issue: "Отсутствует meta description",
        severity: "error",
        suggestion: "Добавьте уникальное описание страницы 150-160 символов",
      });
    } else {
      if (page.descriptionLength < 120) {
        issues.push({
          pageUrl: page.pageUrl,
          issue: "Meta description слишком короткое",
          severity: "warning",
          suggestion: "Рекомендуемая длина description: 150-160 символов",
        });
      }
      if (page.descriptionLength > 180) {
        issues.push({
          pageUrl: page.pageUrl,
          issue: "Meta description слишком длинное",
          severity: "warning",
          suggestion: "Сократите description до 160 символов",
        });
      }
    }

    if (!page.keywords) {
      issues.push({
        pageUrl: page.pageUrl,
        issue: "Отсутствуют keywords",
        severity: "info",
        suggestion: "Добавьте ключевые слова для страницы",
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const totalChecks = pages.length * 3;
  const passedCount = totalChecks - errorCount - warningCount;
  const score = Math.round((passedCount / totalChecks) * 100);

  return { totalPages: pages.length, issues, score, passedCount, warningCount, errorCount };
}

export function generateSitemapXml(
  pages: Array<{ pageUrl: string; updatedAt?: string }>,
  baseUrl: string,
): string {
  const urls = pages
    .map((page) => {
      const lastmod = page.updatedAt
        ? `<lastmod>${page.updatedAt}</lastmod>`
        : "";
      return `  <url>
    <loc>${baseUrl}${page.pageUrl}</loc>
    ${lastmod}
    <changefreq>weekly</changefreq>
    <priority>${page.pageUrl === "/" ? "1.0" : "0.8"}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml
`;
}

export function calculateEmailMetrics(
  sent: number,
  opened: number,
  clicked: number,
  bounced: number,
): {
  openRate: number;
  clickRate: number;
  bounceRate: number;
  ctr: number;
} {
  const delivered = sent - bounced;
  return {
    openRate: delivered > 0 ? Math.round((opened / delivered) * 1000) / 10 : 0,
    clickRate: delivered > 0 ? Math.round((clicked / delivered) * 1000) / 10 : 0,
    bounceRate: sent > 0 ? Math.round((bounced / sent) * 1000) / 10 : 0,
    ctr: opened > 0 ? Math.round((clicked / opened) * 1000) / 10 : 0,
  };
}

export interface EmailProviderConfig {
  provider: "sendgrid" | "mailgun";
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface SendEmailPayload {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmailViaProvider(
  config: EmailProviderConfig,
  payload: SendEmailPayload,
): Promise<SendEmailResult> {
  if (!config.apiKey || config.apiKey === "test") {
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  try {
    if (config.provider === "sendgrid") {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: payload.to.map((email) => ({ email })) }],
          from: {
            email: payload.from || config.fromEmail,
            name: config.fromName || "AI Cosmetology",
          },
          subject: payload.subject,
          content: [{ type: "text/html", value: payload.html }],
        }),
      });
      if (!response.ok) {
        return { success: false, error: `SendGrid error: ${response.status}` };
      }
      return { success: true, messageId: response.headers.get("x-message-id") || undefined };
    }

    return { success: false, error: "Provider not implemented" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
