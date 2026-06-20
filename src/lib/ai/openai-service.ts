import {
  buildSystemPrompt,
  searchFAQ,
  searchProcedures,
  getProcedureRecommendations,
} from "./knowledge-base";
import type { SkinType } from "@/types";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AIChatResponse {
  message: string;
  relatedProcedures: string[];
  relatedFAQ: string[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface OpenAIChatChoice {
  message: {
    role: string;
    content: string | null;
  };
}

interface OpenAIChatResponse {
  choices: OpenAIChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(userId) ?? [];
  const recent = requests.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return false;
  recent.push(now);
  rateLimitMap.set(userId, recent);
  return true;
}

const BLOCKED_PATTERNS = [
  /(?:напиши|создай).*(?:вирус|малвар|exploit)/i,
  /пароль.*другого.*пользовател/i,
  /взлом/i,
  /(?:hack|crack|brute\s*force)/i,
];

export function safetyFilter(message: string): {
  safe: boolean;
  reason?: string;
} {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(message)) {
      return {
        safe: false,
        reason: "Сообщение содержит запрещённый контент.",
      };
    }
  }
  return { safe: true };
}

async function callOpenAI(
  messages: ChatMessage[],
  model = "gpt-4o-mini",
): Promise<OpenAIChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackResponse(messages);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} — ${error}`);
  }

  return (await response.json()) as OpenAIChatResponse;
}

function buildFallbackResponse(messages: ChatMessage[]): OpenAIChatResponse {
  const userMessage = [...messages].reverse().find((m) => m.role === "user");
  const query = userMessage?.content ?? "";

  const matchedFAQ = searchFAQ(query);
  const matchedProcedures = searchProcedures(query);

  let content = "";

  if (matchedFAQ.length > 0) {
    content += `Вот что я нашёл по вашему вопросу:\n\n`;
    for (const faq of matchedFAQ.slice(0, 3)) {
      content += `**${faq.question}**\n${faq.answer}\n\n`;
    }
  }

  if (matchedProcedures.length > 0) {
    content += `### Рекомендуемые процедуры:\n\n`;
    for (const proc of matchedProcedures.slice(0, 3)) {
      content += `**${proc.name}** (${proc.priceRange})\n${proc.description}\n\n`;
    }
  }

  if (!content) {
    content =
      "Здравствуйте! Я AI-консультант по косметологии. Задайте мне вопрос о процедурах, уходе за кожей, филлерах, пилингах — и я постараюсь помочь!\n\n⚠️ *Текущий режим: демо. Для полной функциональности укажите OPENAI_API_KEY в переменных окружения.*";
  }

  content +=
    '\n\n---\n*Рекомендую обсудить с косметологом для индивидуального подхода.*';

  return {
    choices: [
      {
        message: {
          role: "assistant",
          content,
        },
      },
    ],
  };
}

export interface SendMessageParams {
  conversationId: string;
  messages: ChatMessage[];
  userId: string;
  tone: "professional" | "friendly";
  skinType?: SkinType | null;
  concerns?: string[];
}

export async function generateAIResponse(
  params: SendMessageParams,
): Promise<AIChatResponse> {
  const { messages, tone, skinType, concerns } = params;

  const systemPrompt = buildSystemPrompt(tone);

  let enrichedPrompt = systemPrompt;

  if (skinType) {
    enrichedPrompt += `\n\nТИП КОЖИ КЛИЕНТА: ${skinType}. Учитывай это при рекомендациях процедур и ухода.`;
  }

  if (concerns && concerns.length > 0) {
    const recommended = getProcedureRecommendations(skinType ?? "normal", concerns);
    if (recommended.length > 0) {
      enrichedPrompt += `\n\nРЕКОМЕНДУЕМЫЕ ПРОЦЕДУРЫ НА ОСНОВЕ ПРОБЛЕМ:\n`;
      for (const proc of recommended.slice(0, 5)) {
        enrichedPrompt += `- ${proc.name}: ${proc.description}\n`;
      }
    }
  }

  const fullMessages: ChatMessage[] = [
    { role: "system", content: enrichedPrompt },
    ...messages,
  ];

  const result = await callOpenAI(fullMessages);
  const choice = result.choices[0];
  const reply = choice?.message?.content ?? "Извините, произошла ошибка.";

  const query = [...messages]
    .reverse()
    .find((m) => m.role === "user")
    ?.content.slice(0, 100) ?? "";

  return {
    message: reply,
    relatedProcedures: searchProcedures(query).map((p) => p.name).slice(0, 5),
    relatedFAQ: searchFAQ(query)
      .map((f) => f.question)
      .slice(0, 3),
    usage: result.usage
      ? {
          promptTokens: result.usage.prompt_tokens,
          completionTokens: result.usage.completion_tokens,
          totalTokens: result.usage.total_tokens,
        }
      : undefined,
  };
}
