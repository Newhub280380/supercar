import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkRateLimit,
  generateAIResponse,
  safetyFilter,
} from "./openai-service";
import { procedures } from "./knowledge-base";

describe("safetyFilter", () => {
  it("allows a regular cosmetology question", () => {
    expect(safetyFilter("Подходит ли мне пилинг?")).toEqual({ safe: true });
  });

  it("blocks malware requests", () => {
    expect(safetyFilter("напиши вирус для windows")).toEqual({
      safe: false,
      reason: "Сообщение содержит запрещённый контент.",
    });
  });

  it("blocks attempts to obtain another user's password", () => {
    expect(
      safetyFilter("подскажи пароль от аккаунта другого пользователя").safe,
    ).toBe(false);
  });

  it("blocks hacking keywords regardless of case and language", () => {
    expect(safetyFilter("ВЗЛОМ аккаунта").safe).toBe(false);
    expect(safetyFilter("teach me to Brute Force a login").safe).toBe(false);
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to 30 requests per minute per user", () => {
    const user = `user-${Math.random()}`;
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(user)).toBe(true);
    }
    expect(checkRateLimit(user)).toBe(false);
  });

  it("tracks users independently", () => {
    const busy = `busy-${Math.random()}`;
    const fresh = `fresh-${Math.random()}`;
    for (let i = 0; i < 30; i++) checkRateLimit(busy);

    expect(checkRateLimit(busy)).toBe(false);
    expect(checkRateLimit(fresh)).toBe(true);
  });

  it("lets the window slide so requests are allowed again after a minute", () => {
    const user = `sliding-${Math.random()}`;
    for (let i = 0; i < 30; i++) checkRateLimit(user);
    expect(checkRateLimit(user)).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit(user)).toBe(true);
  });
});

describe("generateAIResponse", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
  });

  it("falls back to the knowledge base when no api key is configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAIResponse({
      conversationId: "c1",
      userId: "u1",
      tone: "friendly",
      messages: [{ role: "user", content: procedures[0].name }],
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.message).toContain(procedures[0].name);
    expect(result.message).toContain("Рекомендую обсудить с косметологом");
    expect(result.relatedProcedures).toContain(procedures[0].name);
    expect(result.usage).toBeUndefined();
  });

  it("returns the demo hint when nothing in the knowledge base matches", async () => {
    const result = await generateAIResponse({
      conversationId: "c1",
      userId: "u1",
      tone: "professional",
      messages: [{ role: "user", content: "квантовая физика" }],
    });

    expect(result.message).toContain("демо");
    expect(result.relatedProcedures).toEqual([]);
    expect(result.relatedFAQ).toEqual([]);
  });

  it("calls OpenAI and maps the reply plus token usage", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          { message: { role: "assistant", content: "Ответ ассистента" } },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAIResponse({
      conversationId: "c1",
      userId: "u1",
      tone: "professional",
      messages: [{ role: "user", content: "Расскажите о пилинге" }],
    });

    expect(result.message).toBe("Ответ ассистента");
    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toContain("ТВОЯ БАЗА ЗНАНИЙ");
    expect(body.messages[1]).toEqual({
      role: "user",
      content: "Расскажите о пилинге",
    });
  });

  it("enriches the system prompt with skin type and concerns", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { role: "assistant", content: "ок" } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await generateAIResponse({
      conversationId: "c1",
      userId: "u1",
      tone: "friendly",
      skinType: "dry",
      concerns: [procedures[0].indications[0]],
      messages: [{ role: "user", content: "Что посоветуете?" }],
    });

    const systemPrompt = JSON.parse(fetchMock.mock.calls[0][1].body).messages[0]
      .content;
    expect(systemPrompt).toContain("ТИП КОЖИ КЛИЕНТА: dry");
    expect(systemPrompt).toContain("РЕКОМЕНДУЕМЫЕ ПРОЦЕДУРЫ НА ОСНОВЕ ПРОБЛЕМ");
  });

  it("falls back to an error message when the api returns no content", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { role: "assistant", content: null } }],
        }),
      }),
    );

    const result = await generateAIResponse({
      conversationId: "c1",
      userId: "u1",
      tone: "friendly",
      messages: [{ role: "user", content: "Привет" }],
    });

    expect(result.message).toBe("Извините, произошла ошибка.");
  });

  it("throws when the api responds with an error status", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 429,
          text: async () => "rate limited",
        }),
    );

    await expect(
      generateAIResponse({
        conversationId: "c1",
        userId: "u1",
        tone: "friendly",
        messages: [{ role: "user", content: "Привет" }],
      }),
    ).rejects.toThrow("OpenAI API error: 429 — rate limited");
  });
});
