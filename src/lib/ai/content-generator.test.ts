import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ContentGenerationRequest, ContentTemplateType } from "@/types";
import {
  checkContentRateLimit,
  generateContent,
  generateMockContent,
} from "./content-generator";
import { TEMPLATE_LABELS } from "./content-templates";
import { procedures } from "./knowledge-base";

const request: ContentGenerationRequest = {
  platform: "instagram",
  templateType: "promotion",
  topic: "Скидка на биоревитализацию",
  tone: "friendly",
};

describe("checkContentRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to 20 requests per minute per user", () => {
    const user = `user-${Math.random()}`;
    for (let i = 0; i < 20; i++) {
      expect(checkContentRateLimit(user)).toBe(true);
    }
    expect(checkContentRateLimit(user)).toBe(false);
  });

  it("tracks users independently", () => {
    const busy = `busy-${Math.random()}`;
    for (let i = 0; i < 20; i++) checkContentRateLimit(busy);

    expect(checkContentRateLimit(busy)).toBe(false);
    expect(checkContentRateLimit(`fresh-${Math.random()}`)).toBe(true);
  });

  it("allows requests again once the window has slid", () => {
    const user = `sliding-${Math.random()}`;
    for (let i = 0; i < 20; i++) checkContentRateLimit(user);
    vi.advanceTimersByTime(60_001);

    expect(checkContentRateLimit(user)).toBe(true);
  });
});

describe("generateMockContent", () => {
  it("produces content for every template type", () => {
    for (const templateType of Object.keys(
      TEMPLATE_LABELS,
    ) as ContentTemplateType[]) {
      const result = generateMockContent({ ...request, templateType });
      expect(result.content.length).toBeGreaterThan(50);
      expect(result.wordCount).toBeGreaterThan(10);
    }
  });

  it("extracts unique hashtags", () => {
    const result = generateMockContent({
      ...request,
      templateType: "hashtags",
    });
    expect(result.hashtags!.length).toBeGreaterThan(5);
    expect(new Set(result.hashtags).size).toBe(result.hashtags!.length);
    expect(result.hashtags).toContain("#косметолог");
  });

  it("extracts the subject line for email templates", () => {
    const result = generateMockContent({
      ...request,
      templateType: "email_welcome",
    });
    expect(result.subjectLine).toContain("Добро пожаловать");
  });

  it("extracts the markdown title and a meta description for seo templates", () => {
    const result = generateMockContent({
      ...request,
      templateType: "seo_description",
      service: "Пилинг лица",
    });

    expect(result.title).toContain("Пилинг лица");
    expect(result.metaDescription).toBe(
      result.content.split("\n")[1].slice(0, 160),
    );
  });

  it("does not attach a meta description to non-seo templates", () => {
    expect(generateMockContent(request).metaDescription).toBeUndefined();
  });

  it("detects cosmetology seo keywords in the text", () => {
    const result = generateMockContent({
      ...request,
      templateType: "care_tips",
    });
    expect(result.seoKeywords).toContain("косметолог");
  });

  it("mentions procedures from the knowledge base", () => {
    const result = generateMockContent({ ...request, templateType: "review" });
    expect(result.content).toContain(procedures[0].name);
  });

  it("counts words ignoring repeated whitespace", () => {
    const result = generateMockContent(request);
    expect(result.wordCount).toBe(
      result.content.split(/\s+/).filter(Boolean).length,
    );
  });
});

describe("generateContent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
  });

  it("returns fallback content without an api key and never calls the api", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateContent(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.content).toContain(procedures[0].name);
    expect(result.wordCount).toBeGreaterThan(10);
  });

  it("returns the same generic post fallback for hashtag, email and seo templates", async () => {
    const [post, hashtags, email, seo] = await Promise.all(
      (
        ["promotion", "hashtags", "email_welcome", "seo_description"] as const
      ).map((templateType) => generateContent({ ...request, templateType })),
    );

    expect(hashtags.content).toBe(post.content);
    expect(email.content).toBe(post.content);
    expect(seo.content).toBe(post.content);
    expect(email.subjectLine).toBeUndefined();
  });

  it("sends the built prompt to OpenAI and parses the reply", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          { message: { content: "# Заголовок\nТекст о косметологии #акция" } },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateContent(request);

    expect(result.title).toBe("Заголовок");
    expect(result.hashtags).toEqual(["#акция"]);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].content).toContain(request.topic);
  });

  it("falls back when the api returns no content", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: null } }] }),
      }),
    );

    const result = await generateContent(request);
    expect(result.content).toContain("#косметолог");
    expect(result.hashtags?.length).toBeGreaterThan(0);
  });

  it("falls back to seo styled content when the prompt is an seo prompt", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [] }),
      }),
    );

    const result = await generateContent({
      ...request,
      templateType: "seo_description",
    });
    expect(result.content).toContain(procedures[0].name);
  });

  it("throws when the api responds with an error status", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(generateContent(request)).rejects.toThrow(
      "OpenAI API error: 500",
    );
  });
});
