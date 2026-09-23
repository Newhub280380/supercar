import { NextResponse } from "next/server";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";

/**
 * Совет моделей для комнаты «СОВЕЩАТЕЛЬНАЯ» в 3D-доме: вопрос владельца
 * уходит параллельно всем настроенным LLM-членам совета, затем председатель
 * собирает консенсус. Каждый член включается своим env-ключом — совет
 * работает на тех моделях, что есть, и не падает из-за отсутствующих.
 */
const CONTEXT =
  "Контекст: виртуальная штаб-квартира компании Beauty Art — B2B-дистрибуция " +
  "корейских HA-филлеров ZISHÉL в Казахстане, клиенты — врачи и клиники. " +
  "Ответь по-русски, плотно, 3–5 предложений: позиция + главный аргумент.";

interface MemberResult {
  label: string;
  model: string;
  content?: string;
  error?: string;
  latencyMs: number;
}

async function askPerplexity(question: string): Promise<MemberResult> {
  const start = Date.now();
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: `${CONTEXT}\n\nВопрос: ${question}` }],
        max_tokens: 512,
        temperature: 0.4,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
    return {
      label: "SONAR",
      model: "sonar",
      content: data.choices?.[0]?.message?.content ?? "",
      latencyMs: Date.now() - start,
    };
  } catch (e) {
    return { label: "SONAR", model: "sonar", error: String(e), latencyMs: Date.now() - start };
  }
}

async function askGemini(prompt: string, label = "GEMINI"): Promise<MemberResult> {
  const start = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
        }),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
    return {
      label,
      model: "gemini-2.5-flash",
      content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
      latencyMs: Date.now() - start,
    };
  } catch (e) {
    return { label, model: "gemini-2.5-flash", error: String(e), latencyMs: Date.now() - start };
  }
}

async function askOpenAI(question: string): Promise<MemberResult> {
  const start = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [{ role: "user", content: `${CONTEXT}\n\nВопрос: ${question}` }],
        max_completion_tokens: 512,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
    return {
      label: "GPT",
      model: "gpt-5-mini",
      content: data.choices?.[0]?.message?.content ?? "",
      latencyMs: Date.now() - start,
    };
  } catch (e) {
    return { label: "GPT", model: "gpt-5-mini", error: String(e), latencyMs: Date.now() - start };
  }
}

async function askAnthropic(question: string): Promise<MemberResult> {
  const start = Date.now();
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 512,
        messages: [{ role: "user", content: `${CONTEXT}\n\nВопрос: ${question}` }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
    return {
      label: "CLAUDE",
      model: "claude-sonnet-4-6",
      content: data.content?.[0]?.text ?? "",
      latencyMs: Date.now() - start,
    };
  } catch (e) {
    return { label: "CLAUDE", model: "claude-sonnet-4-6", error: String(e), latencyMs: Date.now() - start };
  }
}

export const POST = withRole(
  "House council error",
  MANAGER_ROLES,
  async (_session, request) => {
    const body = await request.json().catch(() => ({}));
    const question = String(body?.question ?? "").trim().slice(0, 1000);
    if (!question) {
      return NextResponse.json({ error: "Пустой вопрос" }, { status: 400 });
    }

    const jobs: Promise<MemberResult>[] = [];
    if (process.env.PERPLEXITY_API_KEY) jobs.push(askPerplexity(question));
    if (process.env.GEMINI_API_KEY) jobs.push(askGemini(`${CONTEXT}\n\nВопрос: ${question}`));
    if (process.env.OPENAI_API_KEY) jobs.push(askOpenAI(question));
    if (process.env.ANTHROPIC_API_KEY) jobs.push(askAnthropic(question));
    if (!jobs.length) {
      return NextResponse.json(
        { error: "Нет ни одного ключа совета (PERPLEXITY/GEMINI/OPENAI/ANTHROPIC)" },
        { status: 503 },
      );
    }

    const responses = await Promise.all(jobs);
    const answered = responses.filter((r) => r.content);

    // Председатель собирает консенсус: Gemini как дежурный chairman.
    let synthesis = "";
    if (answered.length && process.env.GEMINI_API_KEY) {
      const brief = answered
        .map((r) => `— ${r.label}: ${r.content}`)
        .join("\n");
      const chair = await askGemini(
        `Вопрос владельца бизнеса: «${question}»\n\nОтветы членов совета:\n${brief}\n\n` +
          "Ты председатель совета. Собери консенсус по-русски в 3–4 предложениях: " +
          "общее решение, где модели расходятся, конкретный следующий шаг.",
        "CHAIRMAN",
      );
      synthesis = chair.content ?? "";
    }

    return NextResponse.json({
      question,
      responses,
      synthesis,
      quorum: answered.length,
    });
  },
);
