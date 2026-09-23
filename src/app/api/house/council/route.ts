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

/** Срезает chain-of-thought reasoning-моделей — оставляет финальный ответ. */
function stripThinking(text: string): string {
  let s = text.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").trim();
  const marker = s.search(/(?:^|\n)\s*(?:#{1,3}\s*)?(?:\*\*)?(?:итог|ответ|решение|final|answer|conclusion|synthesis)/i);
  if (marker > 0 && /thinking process|analyz|разбор|reasoning/i.test(s.slice(0, marker))) {
    s = s.slice(marker).trim();
  }
  return s;
}

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
  maxTokens = 512,
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
        max_tokens: maxTokens,
        temperature: 0.4,
      }),
    });
    const raw = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 120)}`);
    }
    if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
    const msg = data.choices?.[0]?.message ?? {};
    const content = stripThinking(msg.content ?? "") ||
      stripThinking(msg.reasoning_content ?? "");
    return {
      label,
      model: data.model ?? model,
      content,
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
    // Контекст можно переопределить вопросом — для задач вне Beauty Art.
    const context = String(body?.context ?? "").trim().slice(0, 2000) || CONTEXT;
    const debate = body?.mode === "debate";
    const prompt = `${context}\n\nВопрос: ${question}`;

    // Реестр членов совета: метка + вызов с произвольным промптом —
    // так каждый раунд дебатов переиспользует тех же участников.
    const members: { label: string; call: (p: string) => Promise<MemberResult> }[] = [];
    if (process.env.PERPLEXITY_API_KEY) {
      members.push({
        label: "SONAR",
        call: (p) => askOpenAICompat(
          "SONAR", "https://api.perplexity.ai",
          process.env.PERPLEXITY_API_KEY!, "sonar", p),
      });
    }
    if (process.env.GEMINI_API_KEY) {
      members.push({ label: "GEMINI", call: (p) => askGemini(p) });
    }

    // Open-модели через локальный FreeLLMAPI-шлюз (бесплатный, :3001).
    // Апстримы с раздельными лимитами: kilo отвечает параллельно,
    // ovh даёт ~1 запрос в 2 мин — держим там ровно одного члена.
    const flUrl = process.env.FREELLMAPI_BASE_URL ?? "http://127.0.0.1:3001/v1";
    const flKey = process.env.FREELLMAPI_API_KEY;
    if (flKey) {
      for (const [label, model] of [
        ["FUSION", "fusion"], // панель шлюза: несколько моделей + судья
        ["NEMOTRON", "nemotron-3-ultra-550b"], // kilo
        ["NEM-120B", "nemotron-3-super-120b"], // kilo, параллельно с ultra
        ["LLAMA-70B", "llama-3.3-70b"], // ovh — один на запрос
        ["AUTO", "auto"], // роутер шлюза: любой здоровый апстрим
      ] as const) {
        members.push({
          label,
          call: (p) => askOpenAICompat(label, flUrl, flKey, model, p),
        });
      }
    }

    // Prime Intellect Inference (платный ключ, api.pinference.ai) —
    // весь фронтир одним шлюзом. Это тяжёлая линейка совета.
    const piUrl =
      process.env.PRIME_INTELLECT_BASE_URL ?? "https://api.pinference.ai/api/v1";
    const piKey = process.env.PRIME_INTELLECT_API_KEY;
    if (piKey) {
      const piModels = (process.env.PRIME_INTELLECT_MODELS ??
        "CLAUDE:anthropic/claude-sonnet-5,GPT:openai/gpt-5.6-terra," +
          "DEEPSEEK:deepseek/deepseek-v4-pro,KIMI:moonshotai/kimi-k3," +
          "GLM:z-ai/glm-5.3,GROK:x-ai/grok-4.7,QWEN-397B:qwen/qwen3.5-397b-a17b")
        .split(",")
        .map((pair) => pair.split(":"))
        .filter((p) => p.length === 2 && p[0] && p[1]);
      for (const [label, model] of piModels) {
        const lb = label.trim();
        const md = model.trim();
        // reasoning-модели (deepseek-pro, kimi-k3, glm) съедают бюджет
        // на размышления — даём больше токенов, иначе контент пустой.
        members.push({
          label: lb,
          call: (p) => askOpenAICompat(lb, piUrl, piKey, md, p, 2500),
        });
      }
    }

    // OmniRoute-шлюз (:20128) — когда у upstream-провайдеров прописаны ключи.
    const omUrl = process.env.OMNIROUTE_BASE_URL ?? "http://127.0.0.1:20128/v1";
    const omKey = process.env.OMNIROUTE_API_KEY;
    if (omKey && process.env.OMNIROUTE_MODEL) {
      members.push({
        label: "OMNI",
        call: (p) => askOpenAICompat(
          "OMNI", omUrl, omKey, process.env.OMNIROUTE_MODEL!, p),
      });
    }

    if (!members.length) {
      return NextResponse.json(
        { error: "Нет ни одного ключа совета" },
        { status: 503 },
      );
    }

    // Раунд 1 — предложения. В дебатах сразу предупреждаем: шаблонные
    // ответы будут публично разнесены оппонентами.
    const r1Prompt = debate
      ? `${prompt}\n\n` +
        "Это первый раунд дебатов. Дальше твой вариант разберут оппоненты. " +
        "Шаблонные ответы («продай бота малому бизнесу», «фриланс», «дропшипинг») " +
        "будут уничтожены — предлагай конкретное и неочевидное, с цифрами и механикой."
      : prompt;
    const responses = await Promise.all(members.map((m) => m.call(r1Prompt)));
    const answered = responses.filter((r) => r.content);

    // Раунд 2 — перекрёстная критика: каждый топит чужие варианты.
    let critiques: MemberResult[] = [];
    if (debate && answered.length > 1) {
      const pool = answered
        .map((r, i) => `ВАРИАНТ ${String.fromCharCode(65 + i)} (${r.label}): ${r.content}`)
        .join("\n\n");
      critiques = await Promise.all(
        members.map(async (m) => {
          const own = responses.find((r) => r.label === m.label);
          const others = answered.filter((r) => r.label !== m.label);
          if (!others.length) {
            return { label: m.label, model: "", latencyMs: 0 } as MemberResult;
          }
          const othersBrief = others
            .map((r) => `ВАРИАНТ ${String.fromCharCode(65 + answered.indexOf(r))}: ${r.content}`)
            .join("\n\n");
          return m.call(
            `Вопрос совета: «${question}»\n\n` +
              `Чужие предложения:\n${othersBrief}\n\n` +
              (own?.content ? `Твой вариант: ${own.content}\n\n` : "") +
              "Ты оппонент на дебатах. По-русски, жёстко и по делу: " +
              "1) назови ОДИН самый слабый чужой вариант (букву) и разнеси его " +
              "конкретной причиной провала — цифры, механика, где он умрёт в реальности. " +
              "2) назови ОДИН чужой вариант, который реально сильнее твоего (или честно " +
              "скажи, что твой лучший и почему). Без лести и воды — 4–6 предложений.",
          );
        }),
      );
    }

    // Раунд 3 — председатель выносит вердикт после критики.

    // Председатель: в quick — консенсус; в debate — вердикт после боя.
    let synthesis = "";
    if (answered.length) {
      const brief = answered
        .map((r) => `— ${r.label}: ${r.content}`)
        .join("\n");
      const fight = critiques
        .filter((c) => c.content)
        .map((c) => `— ${c.label}: ${c.content}`)
        .join("\n");
      const chairPrompt = debate
        ? `Вопрос владельца бизнеса: «${question}»\n\n` +
          `Предложения совета:\n${brief}\n\n` +
          `Перекрёстная критика оппонентов:\n${fight}\n\n` +
          "Ты председатель-арбитр. По-русски, 5–7 предложений: " +
          "1) назови ПОБЕДИТЕЛЯ дебатов (букву/метку) и почему его вариант пережил критику; " +
          "2) одной строкой — главная причина провала каждого проигравшего; " +
          "3) итоговый конкретный шаг. Если все варианты слабые — честно скажи и предложи свой."
        : `Вопрос владельца бизнеса: «${question}»\n\nОтветы членов совета:\n${brief}\n\n` +
          "Ты председатель совета. Собери консенсус по-русски в 3–4 предложениях: " +
          "общее решение, где модели расходятся, конкретный следующий шаг.";
      let chair: MemberResult = { label: "CHAIRMAN", model: "", latencyMs: 0 };
      const tryChair = async (fn: () => Promise<MemberResult>) => {
        if (!chair.content) chair = await fn();
      };
      // В дебатах арбитром идёт Claude Opus 5 — не член совета, судит честно.
      if (debate && piKey) {
        await tryChair(() =>
          askOpenAICompat("CHAIRMAN", piUrl, piKey, "anthropic/claude-opus-5",
            chairPrompt, 2500));
      }
      if (process.env.GEMINI_API_KEY) {
        await tryChair(() => askGemini(chairPrompt, "CHAIRMAN"));
      }
      if (process.env.PERPLEXITY_API_KEY) {
        await tryChair(() =>
          askOpenAICompat("CHAIRMAN", "https://api.perplexity.ai",
            process.env.PERPLEXITY_API_KEY!, "sonar", chairPrompt));
      }
      if (piKey) {
        await tryChair(() =>
          askOpenAICompat("CHAIRMAN", piUrl, piKey, "anthropic/claude-opus-5",
            chairPrompt, 2500));
      }
      if (flKey) {
        await tryChair(() =>
          askOpenAICompat("CHAIRMAN", flUrl, flKey, "auto", chairPrompt));
      }
      synthesis = stripThinking(chair.content ?? "");
    }

    return NextResponse.json({
      question,
      mode: debate ? "debate" : "quick",
      responses,
      critiques: critiques.filter((c) => c.content || c.error),
      synthesis,
      quorum: answered.length,
    });
  },
);
