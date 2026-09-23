import { NextResponse } from "next/server";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";

/**
 * Совет моделей для комнаты «СОВЕЩАТЕЛЬНАЯ» в 3D-доме: вопрос владельца
 * уходит параллельно всем членам совета, председатель собирает консенсус.
 *
 * Члены — через OpenAI-совместимые шлюзы: прямой Perplexity, прямой Gemini
 * и локальный FreeLLMAPI (:3001), который бесплатно раздаёт open-модели.
 * Каждый член включается своим env-ключом — отсутствующий просто молчит.
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

/** Универсальный вызов OpenAI-совместимого /chat/completions. */
async function askOpenAICompat(
  label: string,
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
): Promise<MemberResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.4,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
    return {
      label,
      model: data.model ?? model,
      content: data.choices?.[0]?.message?.content ?? "",
      latencyMs: Date.now() - start,
    };
  } catch (e) {
    return { label, model, error: String(e), latencyMs: Date.now() - start };
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

export const POST = withRole(
  "House council error",
  MANAGER_ROLES,
  async (_session, request) => {
    const body = await request.json().catch(() => ({}));
    const question = String(body?.question ?? "").trim().slice(0, 1000);
    if (!question) {
      return NextResponse.json({ error: "Пустой вопрос" }, { status: 400 });
    }
    const prompt = `${CONTEXT}\n\nВопрос: ${question}`;

    const jobs: Promise<MemberResult>[] = [];
    const background: Promise<void>[] = [];
    const serialResults: MemberResult[] = [];
    if (process.env.PERPLEXITY_API_KEY) {
      jobs.push(askOpenAICompat(
        "SONAR", "https://api.perplexity.ai",
        process.env.PERPLEXITY_API_KEY, "sonar", prompt));
    }
    if (process.env.GEMINI_API_KEY) jobs.push(askGemini(prompt));

    // Open-модели через локальный FreeLLMAPI-шлюз (бесплатный, :3001).
    // У free-апстримов общий рейт-лимит ~2 мин между запросами — вызываем
    // членов последовательно с паузой, иначе все после первого словят 429.
    const flUrl = process.env.FREELLMAPI_BASE_URL ?? "http://127.0.0.1:3001/v1";
    const flKey = process.env.FREELLMAPI_API_KEY;
    if (flKey) {
      // FUSION — собственная панель шлюза: несколько моделей + судья
      // одним вызовом; NEMOTRON — тяжёлая одиночная. FUSION первым —
      // ценнее всего, пока лимит апстрима не съеден.
      const flMembers = [
        ["FUSION", "fusion"],
        ["NEMOTRON", "nemotron-3-ultra-550b"],
      ] as const;
      const FL_GAP_MS = 75_000;
      background.push(
        (async () => {
          for (const [i, [label, model]] of flMembers.entries()) {
            if (i > 0) await new Promise((r) => setTimeout(r, FL_GAP_MS));
            serialResults.push(
              await askOpenAICompat(label, flUrl, flKey, model, prompt),
            );
          }
        })(),
      );
    }

    // OmniRoute-шлюз (:20128) — когда у upstream-провайдеров прописаны ключи.
    const omUrl = process.env.OMNIROUTE_BASE_URL ?? "http://127.0.0.1:20128/v1";
    const omKey = process.env.OMNIROUTE_API_KEY;
    if (omKey && process.env.OMNIROUTE_MODEL) {
      jobs.push(askOpenAICompat(
        "OMNI", omUrl, omKey, process.env.OMNIROUTE_MODEL, prompt));
    }

    if (!jobs.length && !background.length) {
      return NextResponse.json(
        { error: "Нет ни одного ключа совета" },
        { status: 503 },
      );
    }

    const [direct] = await Promise.all([
      Promise.all(jobs),
      Promise.all(background),
    ]);
    const responses = [...direct, ...serialResults];
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
