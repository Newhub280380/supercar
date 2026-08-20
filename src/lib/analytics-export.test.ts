/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AIInsight,
  BusinessHealth,
  MetricSummary,
  RevenueDataPoint,
  ServicePopularity,
} from "./analytics-mock-data";
import {
  exportAnalyticsCsv,
  exportAnalyticsExcel,
  exportAnalyticsPdf,
} from "./analytics-export";

const revenue: RevenueDataPoint[] = [
  { month: "Янв", revenue: 185000, appointments: 52, newClients: 8 },
  { month: "Фев", revenue: 210000, appointments: 58, newClients: 12 },
];

const services: ServicePopularity[] = [
  { name: "Чистка лица", count: 45, revenue: 225000, category: "Уход" },
  {
    name: 'Пилинг "лёгкий", поверхностный',
    count: 12,
    revenue: 60000,
    category: "Пилинги",
  },
];

const metrics: MetricSummary = {
  ltv: 15000,
  avgCheck: 4200,
  conversionRate: 68,
  retentionRate: 72,
  revenueGrowth: 14.8,
  clientGrowth: 22.3,
};

const health: BusinessHealth = {
  score: 78,
  revenueTrend: "up",
  clientRetention: 72,
  utilization: 68,
  avgCheck: 4200,
  newClientsGrowth: 15,
};

const insights: AIInsight[] = [
  {
    id: "ins-1",
    type: "positive",
    title: "Рост инъекций",
    description: "Рост на 35% за квартал",
    impact: "high",
    actionLabel: "Смотреть отчёт",
  },
];

let createObjectUrl: ReturnType<typeof vi.fn>;
let filenames: string[];

function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

function blobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function lastBlob(): Blob {
  return createObjectUrl.mock.calls.at(-1)![0] as Blob;
}

beforeEach(() => {
  filenames = [];
  createObjectUrl = vi.fn(() => "blob:mock-url");
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: createObjectUrl,
      revokeObjectURL: vi.fn(),
    }),
  );
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    filenames.push(this.download);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("exportAnalyticsCsv", () => {
  it("writes the three report sections in order", async () => {
    exportAnalyticsCsv(revenue, services, metrics);
    const text = await blobText(lastBlob());

    expect((await blobBytes(lastBlob())).slice(0, 3)).toEqual(
      new Uint8Array([0xef, 0xbb, 0xbf]),
    );
    expect(text.indexOf("=== КЛЮЧЕВЫЕ МЕТРИКИ ===")).toBeLessThan(
      text.indexOf("=== ДОХОД ПО МЕСЯЦАМ ==="),
    );
    expect(text.indexOf("=== ДОХОД ПО МЕСЯЦАМ ===")).toBeLessThan(
      text.indexOf("=== ПОПУЛЯРНОСТЬ УСЛУГ ==="),
    );
  });

  it("includes a row per revenue point and per service", async () => {
    exportAnalyticsCsv(revenue, services, metrics);
    const text = await blobText(lastBlob());

    expect(text).toContain("Янв,185000,52,8");
    expect(text).toContain("Чистка лица,Уход,45,225000");
  });

  it("escapes service names containing commas and quotes", async () => {
    exportAnalyticsCsv(revenue, services, metrics);
    expect(await blobText(lastBlob())).toContain(
      '"Пилинг ""лёгкий"", поверхностный",Пилинги',
    );
  });

  it("formats metric values with thousands separators", async () => {
    exportAnalyticsCsv(revenue, services, metrics);
    const csv = await blobText(lastBlob());
    expect(csv).toMatch(/LTV клиента,₽15\s?000/);
    expect(csv).toContain("Конверсия,68%");
  });

  it("downloads a csv named after the filename argument", () => {
    exportAnalyticsCsv(revenue, services, metrics, "q1");
    expect(filenames).toEqual(["q1.csv"]);
    expect(lastBlob().type).toBe("text/csv;charset=utf-8;");
  });

  it("defaults the filename", () => {
    exportAnalyticsCsv(revenue, services, metrics);
    expect(filenames).toEqual(["analytics-report.csv"]);
  });
});

describe("exportAnalyticsExcel", () => {
  it("produces a spreadsheet with one worksheet per section", async () => {
    exportAnalyticsExcel(revenue, services, metrics);
    const xml = await blobText(lastBlob());

    expect(xml.startsWith('<?xml version="1.0"?>')).toBe(true);
    expect(xml).toContain('<?mso-application progid="Excel.Sheet"?>');
    expect(xml).toContain('ss:Name="Метрики"');
    expect(xml).toContain('ss:Name="Доходы"');
    expect(xml).toContain('ss:Name="Услуги"');
    expect(xml.trimEnd().endsWith("</Workbook>")).toBe(true);
  });

  it("writes one row per revenue point and service", async () => {
    exportAnalyticsExcel(revenue, services, metrics);
    const xml = await blobText(lastBlob());

    expect(xml).toContain('<Data ss:Type="Number">185000</Data>');
    expect(xml).toContain("Чистка лица");
    expect(xml.match(/<Row>/g)!.length).toBe(
      6 + revenue.length + services.length,
    );
  });

  it("downloads an excel file", () => {
    exportAnalyticsExcel(revenue, services, metrics);
    expect(filenames).toEqual(["analytics-report.xls"]);
    expect(lastBlob().type).toBe("application/vnd.ms-excel;charset=utf-8;");
  });
});

describe("exportAnalyticsPdf", () => {
  it("prints the report through a new window", () => {
    const printWindow = {
      document: { write: vi.fn(), close: vi.fn() },
      print: vi.fn(),
      onload: null as null | (() => void),
    };
    const open = vi.fn(() => printWindow);
    vi.stubGlobal("window", Object.assign(window, { open }));

    exportAnalyticsPdf(revenue, services, metrics, health, insights);

    expect(open).toHaveBeenCalledWith("", "_blank");
    const html = printWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain("Аналитический отчёт");
    expect(html).toContain("Рост инъекций");
    expect(html).toContain("78/100");
    expect(printWindow.document.close).toHaveBeenCalled();

    printWindow.onload!();
    expect(printWindow.print).toHaveBeenCalled();
  });

  it("falls back to an html download when the popup is blocked", async () => {
    vi.stubGlobal("window", Object.assign(window, { open: vi.fn(() => null) }));

    exportAnalyticsPdf(revenue, services, metrics, health, insights);

    expect(filenames).toEqual(["analytics-report.html"]);
    expect(await blobText(lastBlob())).toContain("Аналитический отчёт");
  });

  it("colours the health bar by score band", async () => {
    vi.stubGlobal("window", Object.assign(window, { open: vi.fn(() => null) }));

    exportAnalyticsPdf(
      revenue,
      services,
      metrics,
      { ...health, score: 90 },
      insights,
    );
    expect(await blobText(lastBlob())).toContain("#22c55e");

    exportAnalyticsPdf(
      revenue,
      services,
      metrics,
      { ...health, score: 65 },
      insights,
    );
    expect(await blobText(lastBlob())).toContain("#eab308");

    exportAnalyticsPdf(
      revenue,
      services,
      metrics,
      { ...health, score: 40 },
      insights,
    );
    const low = await blobText(lastBlob());
    expect(low).toContain("#ef4444");
    expect(low).toContain("Требует внимания");
  });
});
