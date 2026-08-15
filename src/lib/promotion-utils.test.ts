import { afterEach, describe, expect, it, vi } from "vitest";
import {
  auditSeoPages,
  buildUtmUrl,
  calculateEmailMetrics,
  generateRobotsTxt,
  generateSitemapXml,
  parseUtmParams,
  sendEmailViaProvider,
} from "./promotion-utils";

describe("buildUtmUrl", () => {
  it("appends the required utm params", () => {
    const url = buildUtmUrl("https://example.com/page", {
      source: "instagram",
      medium: "social",
      campaign: "spring",
    });

    expect(url).toBe(
      "https://example.com/page?utm_source=instagram&utm_medium=social&utm_campaign=spring",
    );
  });

  it("appends optional term and content params", () => {
    const url = new URL(
      buildUtmUrl("https://example.com/", {
        source: "vk",
        medium: "cpc",
        campaign: "peeling",
        term: "пилинг",
        content: "banner-1",
      }),
    );

    expect(url.searchParams.get("utm_term")).toBe("пилинг");
    expect(url.searchParams.get("utm_content")).toBe("banner-1");
  });

  it("overwrites existing utm params instead of duplicating them", () => {
    const url = new URL(
      buildUtmUrl("https://example.com/?utm_source=old&ref=abc", {
        source: "telegram",
        medium: "social",
        campaign: "autumn",
      }),
    );

    expect(url.searchParams.getAll("utm_source")).toEqual(["telegram"]);
    expect(url.searchParams.get("ref")).toBe("abc");
  });

  it("throws on an invalid base url", () => {
    expect(() =>
      buildUtmUrl("not-a-url", { source: "s", medium: "m", campaign: "c" }),
    ).toThrow();
  });
});

describe("parseUtmParams", () => {
  it("extracts only the utm params that are present", () => {
    expect(
      parseUtmParams(
        "https://example.com/?utm_source=vk&utm_campaign=spring&foo=bar",
      ),
    ).toEqual({ utm_source: "vk", utm_campaign: "spring" });
  });

  it("returns null when no utm params are present", () => {
    expect(parseUtmParams("https://example.com/?foo=bar")).toBeNull();
  });

  it("returns null for an invalid url", () => {
    expect(parseUtmParams("://broken")).toBeNull();
  });
});

const page = {
  pageUrl: "/services",
  metaTitle: "Косметологические услуги в нашем салоне красоты",
  metaDescription: "x".repeat(150),
  keywords: "косметолог, услуги",
  titleLength: 45,
  descriptionLength: 150,
};

describe("auditSeoPages", () => {
  it("reports a perfect score for a compliant page", () => {
    const result = auditSeoPages([page]);
    expect(result).toMatchObject({
      totalPages: 1,
      issues: [],
      score: 100,
      passedCount: 3,
      warningCount: 0,
      errorCount: 0,
    });
  });

  it("flags missing title, description and keywords with the right severities", () => {
    const result = auditSeoPages([
      { ...page, metaTitle: "", metaDescription: "", keywords: "" },
    ]);

    expect(result.errorCount).toBe(2);
    expect(result.issues.filter((i) => i.severity === "info")).toHaveLength(1);
    expect(result.issues.map((i) => i.severity)).toEqual([
      "error",
      "error",
      "info",
    ]);
    expect(result.score).toBe(33);
  });

  it("warns about a too short title and too short description", () => {
    const result = auditSeoPages([
      { ...page, titleLength: 20, descriptionLength: 100 },
    ]);

    expect(result.warningCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.issues.map((i) => i.issue)).toEqual([
      "Meta title слишком короткий",
      "Meta description слишком короткое",
    ]);
  });

  it("warns about a too long title and too long description", () => {
    const result = auditSeoPages([
      { ...page, titleLength: 80, descriptionLength: 200 },
    ]);

    expect(result.issues.map((i) => i.issue)).toEqual([
      "Meta title слишком длинный",
      "Meta description слишком длинное",
    ]);
  });

  it("aggregates issues across pages", () => {
    const result = auditSeoPages([
      page,
      { ...page, pageUrl: "/blog", keywords: "" },
    ]);
    expect(result.totalPages).toBe(2);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].pageUrl).toBe("/blog");
    expect(result.passedCount).toBe(6);
  });
});

describe("generateSitemapXml", () => {
  it("gives the home page priority 1.0 and other pages 0.8", () => {
    const xml = generateSitemapXml(
      [{ pageUrl: "/" }, { pageUrl: "/pricing", updatedAt: "2024-05-01" }],
      "https://example.com",
    );

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).toContain("<loc>https://example.com/pricing</loc>");
    expect(xml).toContain("<priority>0.8</priority>");
    expect(xml).toContain("<lastmod>2024-05-01</lastmod>");
  });

  it("omits lastmod when updatedAt is absent", () => {
    expect(
      generateSitemapXml([{ pageUrl: "/about" }], "https://example.com"),
    ).not.toContain("lastmod");
  });

  it("renders a valid empty sitemap", () => {
    const xml = generateSitemapXml([], "https://example.com");
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
    expect(xml).not.toContain("<url>");
  });
});

describe("generateRobotsTxt", () => {
  it("disallows private sections and links the sitemap", () => {
    const txt = generateRobotsTxt("https://example.com");
    expect(txt).toContain("User-agent: *");
    expect(txt).toContain("Disallow: /dashboard/");
    expect(txt).toContain("Disallow: /api/");
    expect(txt).toContain("Disallow: /auth/");
    expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
  });
});

describe("calculateEmailMetrics", () => {
  it("computes rates against delivered messages", () => {
    expect(calculateEmailMetrics(1000, 400, 100, 100)).toEqual({
      openRate: 44.4,
      clickRate: 11.1,
      bounceRate: 10,
      ctr: 25,
    });
  });

  it("returns zeros when nothing was sent", () => {
    expect(calculateEmailMetrics(0, 0, 0, 0)).toEqual({
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      ctr: 0,
    });
  });

  it("returns a zero ctr when there are no opens", () => {
    expect(calculateEmailMetrics(100, 0, 0, 0).ctr).toBe(0);
  });

  it("guards against a fully bounced campaign", () => {
    const metrics = calculateEmailMetrics(50, 0, 0, 50);
    expect(metrics.openRate).toBe(0);
    expect(metrics.clickRate).toBe(0);
    expect(metrics.bounceRate).toBe(100);
  });
});

describe("sendEmailViaProvider", () => {
  const payload = { to: ["a@b.co"], subject: "Hi", html: "<p>Hi</p>" };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a mock success without an api key", async () => {
    const result = await sendEmailViaProvider(
      { provider: "sendgrid", apiKey: "", fromEmail: "from@b.co" },
      payload,
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^mock-\d+$/);
  });

  it("returns a mock success for the literal test api key", async () => {
    const result = await sendEmailViaProvider(
      { provider: "sendgrid", apiKey: "test", fromEmail: "from@b.co" },
      payload,
    );

    expect(result.success).toBe(true);
  });

  it("posts to sendgrid and returns the message id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      headers: new Headers({ "x-message-id": "msg-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendEmailViaProvider(
      {
        provider: "sendgrid",
        apiKey: "real-key",
        fromEmail: "from@b.co",
        fromName: "Salon",
      },
      { ...payload, from: "sender@b.co" },
    );

    expect(result).toEqual({ success: true, messageId: "msg-123" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.sendgrid.com/v3/mail/send");
    const body = JSON.parse(init.body);
    expect(body.from).toEqual({ email: "sender@b.co", name: "Salon" });
    expect(body.personalizations).toEqual([{ to: [{ email: "a@b.co" }] }]);
    expect(init.headers.Authorization).toBe("Bearer real-key");
  });

  it("surfaces a sendgrid http error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 401, headers: new Headers() }),
    );

    await expect(
      sendEmailViaProvider(
        { provider: "sendgrid", apiKey: "real-key", fromEmail: "from@b.co" },
        payload,
      ),
    ).resolves.toEqual({ success: false, error: "SendGrid error: 401" });
  });

  it("surfaces a thrown network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    await expect(
      sendEmailViaProvider(
        { provider: "sendgrid", apiKey: "real-key", fromEmail: "from@b.co" },
        payload,
      ),
    ).resolves.toEqual({ success: false, error: "network down" });
  });

  it("reports unimplemented providers", async () => {
    await expect(
      sendEmailViaProvider(
        { provider: "mailgun", apiKey: "real-key", fromEmail: "from@b.co" },
        payload,
      ),
    ).resolves.toEqual({ success: false, error: "Provider not implemented" });
  });
});
