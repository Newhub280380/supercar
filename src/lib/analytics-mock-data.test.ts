import { describe, expect, it } from "vitest";
import {
  aiInsights,
  calculateBusinessHealth,
  calculateMetrics,
  clientSegments,
  generateForecastData,
  generateHeatmapData,
  heatmapDays,
  heatmapHours,
  monthlyRevenueData,
} from "./analytics-mock-data";

describe("generateHeatmapData", () => {
  it("returns one cell per day and working hour", () => {
    const data = generateHeatmapData();
    expect(data).toHaveLength(heatmapDays.length * heatmapHours.length);
    expect(new Set(data.map((c) => `${c.day}-${c.hour}`)).size).toBe(
      data.length,
    );
  });

  it("clamps every value into the 0..10 range", () => {
    for (const cell of generateHeatmapData()) {
      expect(cell.value).toBeGreaterThanOrEqual(0);
      expect(cell.value).toBeLessThanOrEqual(10);
    }
  });

  it("covers business hours from 9 to 20", () => {
    expect(heatmapHours[0]).toBe(9);
    expect(heatmapHours.at(-1)).toBe(20);
    expect(heatmapDays).toEqual(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
  });

  it("keeps Sunday quieter than Saturday on average", () => {
    const data = generateHeatmapData();
    const average = (day: number) => {
      const cells = data.filter((c) => c.day === day);
      return cells.reduce((sum, c) => sum + c.value, 0) / cells.length;
    };

    expect(average(6)).toBeLessThan(average(5));
  });
});

describe("generateForecastData", () => {
  it("returns 12 points split into actual history and forecast", () => {
    const data = generateForecastData();
    expect(data).toHaveLength(12);

    const history = data.slice(0, 6);
    const forecast = data.slice(6);

    expect(
      history.every((p) => p.forecast === null && p.upperBound === null),
    ).toBe(true);
    expect(
      forecast.every((p) => p.actual === null && p.forecast !== null),
    ).toBe(true);
  });

  it("brackets each forecast between its lower and upper bound", () => {
    for (const point of generateForecastData().slice(6)) {
      expect(point.lowerBound!).toBeLessThan(point.forecast!);
      expect(point.upperBound!).toBeGreaterThan(point.forecast!);
    }
  });

  it("uses a ±15% confidence interval around every forecast", () => {
    for (const point of generateForecastData().slice(6)) {
      expect(point.lowerBound).toBe(Math.round(point.forecast! * 0.85));
      expect(point.upperBound).toBe(Math.round(point.forecast! * 1.15));
    }
  });

  it("labels every point with a month name", () => {
    expect(generateForecastData().every((p) => p.month.length > 0)).toBe(true);
  });
});

describe("calculateMetrics", () => {
  it("derives ltv and average check from the monthly revenue series", () => {
    const totalRevenue = monthlyRevenueData.reduce(
      (sum, d) => sum + d.revenue,
      0,
    );
    const totalAppointments = monthlyRevenueData.reduce(
      (sum, d) => sum + d.appointments,
      0,
    );
    const totalNewClients = monthlyRevenueData.reduce(
      (sum, d) => sum + d.newClients,
      0,
    );

    const metrics = calculateMetrics();
    expect(metrics.ltv).toBe(Math.round(totalRevenue / totalNewClients));
    expect(metrics.avgCheck).toBe(Math.round(totalRevenue / totalAppointments));
    expect(metrics.conversionRate).toBeGreaterThan(0);
    expect(metrics.retentionRate).toBeGreaterThan(0);
  });
});

describe("calculateBusinessHealth", () => {
  it("returns a score inside 0..100 with a known trend", () => {
    const health = calculateBusinessHealth();
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(["up", "down", "stable"]).toContain(health.revenueTrend);
  });
});

describe("static datasets", () => {
  it("expose consistent insights", () => {
    expect(new Set(aiInsights.map((i) => i.id)).size).toBe(aiInsights.length);
    for (const insight of aiInsights) {
      expect(["positive", "warning", "suggestion", "trend"]).toContain(
        insight.type,
      );
      expect(["low", "medium", "high"]).toContain(insight.impact);
    }
  });

  it("expose client segments with positive revenue", () => {
    expect(clientSegments.length).toBeGreaterThan(0);
    expect(clientSegments.every((s) => s.revenue > 0 && s.count > 0)).toBe(
      true,
    );
  });
});
