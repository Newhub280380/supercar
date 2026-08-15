import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ContentPlatform,
  ContentTemplateType,
  ContentTone,
} from "@/types";
import {
  PLATFORM_LABELS,
  TEMPLATE_LABELS,
  TONE_LABELS,
  buildGeneratorPrompt,
  contentTemplates,
  getTemplate,
} from "./content-templates";

const baseParams = {
  topic: "Биоревитализация со скидкой",
  tone: "professional" as ContentTone,
  length: "medium" as const,
  platform: "instagram" as ContentPlatform,
};

describe("contentTemplates", () => {
  it("exposes a template per template type with unique ids", () => {
    const ids = contentTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(Object.keys(TEMPLATE_LABELS).sort());
  });

  it("builds a non-empty prompt for every template", () => {
    for (const template of contentTemplates) {
      const prompt = template.promptBuilder(baseParams);
      expect(prompt.length).toBeGreaterThan(50);
      expect(prompt).toContain(baseParams.topic);
    }
  });
});

describe("getTemplate", () => {
  it("returns the template matching the id", () => {
    expect(getTemplate("promotion").label).toBe("Акция / Скидка");
  });

  it("throws for an unknown id", () => {
    expect(() => getTemplate("nope" as ContentTemplateType)).toThrow(
      "Template not found: nope",
    );
  });
});

describe("prompt composition", () => {
  it("varies the instructions by tone", () => {
    const professional = getTemplate("promotion").promptBuilder(baseParams);
    const entertaining = getTemplate("promotion").promptBuilder({
      ...baseParams,
      tone: "entertaining",
    });

    expect(professional).toContain("профессиональном, экспертном стиле");
    expect(entertaining).toContain("развлекательном стиле");
  });

  it("varies the constraints by platform", () => {
    expect(getTemplate("promotion").promptBuilder(baseParams)).toContain(
      "Платформа: Instagram",
    );
    expect(
      getTemplate("promotion").promptBuilder({ ...baseParams, platform: "vk" }),
    ).toContain("Платформа: ВКонтакте");
  });

  it("varies the target length", () => {
    expect(
      getTemplate("promotion").promptBuilder({
        ...baseParams,
        length: "short",
      }),
    ).toContain("100-150 слов");
    expect(
      getTemplate("promotion").promptBuilder({ ...baseParams, length: "long" }),
    ).toContain("400-500 слов");
  });

  it("includes the audience when given and a default otherwise", () => {
    expect(
      getTemplate("promotion").promptBuilder({
        ...baseParams,
        audience: "мамы в декрете",
      }),
    ).toContain("мамы в декрете");
    expect(getTemplate("review").promptBuilder(baseParams)).toContain(
      "Аудитория: потенциальные клиенты.",
    );
  });

  it("uses the service name for seo descriptions and falls back to the topic", () => {
    expect(
      getTemplate("seo_description").promptBuilder({
        ...baseParams,
        service: "Пилинг лица",
      }),
    ).toContain("Услуга: Пилинг лица");
    expect(getTemplate("seo_description").promptBuilder(baseParams)).toContain(
      `Услуга: ${baseParams.topic}`,
    );
  });

  it("lists explicit seo keywords when provided", () => {
    const prompt = getTemplate("seo_description").promptBuilder({
      ...baseParams,
      seoKeywords: ["пилинг", "чистка лица"],
    });
    expect(prompt).toContain("Ключевые слова: пилинг, чистка лица");
  });
});

describe("seasonal prompts", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the season matching the current date", () => {
    vi.useFakeTimers();
    const cases: Array<[string, string, string]> = [
      ["2024-03-15", "Весна", "сезон обновления"],
      ["2024-07-15", "Лето", "защита от солнца"],
      ["2024-10-15", "Осень", "восстановление после лета"],
      ["2024-01-15", "Зима", "защита от холода"],
    ];

    for (const [date, seasonName, tipFragment] of cases) {
      vi.setSystemTime(new Date(`${date}T12:00:00Z`));
      expect(getTemplate("seasonal").promptBuilder(baseParams)).toContain(
        `Сезон: ${seasonName}`,
      );
      expect(getTemplate("care_tips").promptBuilder(baseParams)).toContain(
        tipFragment,
      );
    }
  });
});

describe("buildGeneratorPrompt", () => {
  it("defaults the platform to instagram", () => {
    const prompt = buildGeneratorPrompt(getTemplate("promotion"), {
      topic: "Акция",
      tone: "friendly",
      length: "short",
    });

    expect(prompt).toContain("Платформа: Instagram");
  });
});

describe("label maps", () => {
  it("cover every platform, template and tone", () => {
    expect(Object.keys(PLATFORM_LABELS)).toEqual([
      "instagram",
      "telegram",
      "vk",
    ]);
    expect(Object.keys(TONE_LABELS)).toEqual([
      "professional",
      "friendly",
      "entertaining",
    ]);
    expect(
      Object.values(TEMPLATE_LABELS).every((label) => label.length > 0),
    ).toBe(true);
  });
});
