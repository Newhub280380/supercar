import {
  buildSystemPrompt,
  searchFAQ,
  searchProcedures,
  getProcedureRecommendations,
} from "./knowledge-base";
import {
  createChatCompletion,
  streamChatCompletion,
  extractReply,
  isAIEnabled,
  type ChatCompletionParams,
} from "./openai-client";
import { logger } from "@/lib/logger";
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

export interface StreamCallbacks {
  onToken: (token: string) => void;
  signal?: AbortSignal;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const RATE_LIMIT_MAX_USERS = 10_000;

const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const requests = (rateLimitMap.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );

  if (rateLimitMap.size > RATE_LIMIT_MAX_USERS) {
    rateLimitMap.clear();
  }

  if (requests.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(userId, requests);
    return false;
  }

  requests.push(now);
  rateLimitMap.set(userId, requests);
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
  if (typeof message !== "string" || !message.trim()) {
    return { safe: false, reason: "Сообщение не может быть пустым." };
  }
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

function buildEnrichedMessages(
  baseMessages: ChatMessage[],
  tone: "professional" | "friendly",
  skinType?: SkinType | null,
  concerns?: string[],
): ChatMessage[] {
  let systemPrompt = buildSystemPrompt(tone);

  if (skinType) {
    systemPrompt += `\n\nТИП КОЖИ КЛИЕНТА: ${skinType}. Учитывай это при рекомендациях процедур и ухода.`;
  }

  if (concerns && concerns.length > 0) {
    const recommended = getProcedureRecommendations(skinType ?? "normal", concerns);
    if (recommended.length > 0) {
      systemPrompt += `\n\nРЕКОМЕНДУЕМЫЕ ПРОЦЕДУРЫ НА ОСНОВЕ ПРОБЛЕМ:\n`;
      for (const proc of recommended.slice(0, 5)) {
        systemPrompt += `- ${proc.name}: ${proc.description}\n`;
      }
    }
  }

  return [{ role: "system", content: systemPrompt }, ...baseMessages];
}

function buildRelated(query: string) {
  return {
    relatedProcedures: searchProcedures(query).map((p) => p.name).slice(0, 5),
    relatedFAQ: searchFAQ(query).map((f) => f.question).slice(0, 3),
  };
}

function buildFallbackMessage(messages: ChatMessage[]): string {
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

  content += "\n\n---\n*Рекомендую обсудить с косметологом для индивидуального подхода.*";

  return content;
}

function toUsage(usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null | undefined) {
  return usage
    ? {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      }
    : undefined;
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
  const log = logger.scope("ai:chat");

  const fullMessages = buildEnrichedMessages(messages, tone, skinType, concerns);
  const query =
    [...messages].reverse().find((m) => m.role === "user")?.content.slice(0, 100) ?? "";

  if (!isAIEnabled()) {
    log.warn("OPENAI_API_KEY missing, returning fallback response");
    const message = buildFallbackMessage(messages);
    return { message, ...buildRelated(query) };
  }

  const request: ChatCompletionParams = {
    messages: fullMessages as ChatCompletionParams["messages"],
    temperature: 0.7,
    maxTokens: 1024,
  };

  try {
    const completion = await createChatCompletion(request);
    const message = extractReply(completion);
    return {
      message,
      ...buildRelated(query),
      usage: toUsage(completion.usage ?? null),
    };
  } catch (error) {
    log.error("generateAIResponse failed, using fallback", error);
    const message = buildFallbackMessage(messages);
    return { message, ...buildRelated(query) };
  }
}

export async function streamAIResponse(
  params: SendMessageParams,
  callbacks: StreamCallbacks,
): Promise<AIChatResponse> {
  const { messages, tone, skinType, concerns } = params;
  const log = logger.scope("ai:chat");

  const fullMessages = buildEnrichedMessages(messages, tone, skinType, concerns);
  const query =
    [...messages].reverse().find((m) => m.role === "user")?.content.slice(0, 100) ?? "";

  if (!isAIEnabled()) {
    log.warn("OPENAI_API_KEY missing, streaming fallback response");
    const message = buildFallbackMessage(messages);
    for (const tokenChunk of chunkText(message)) {
      callbacks.onToken(tokenChunk);
    }
    return { message, ...buildRelated(query) };
  }

  const request: ChatCompletionParams = {
    messages: fullMessages as ChatCompletionParams["messages"],
    temperature: 0.7,
    maxTokens: 1024,
    signal: callbacks.signal,
  };

  try {
    const { content, usage } = await streamChatCompletion(request, callbacks.onToken);
    return {
      message: content || "Извините, произошла ошибка при обработке ответа.",
      ...buildRelated(query),
      usage: toUsage(usage),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      log.info("stream aborted by client");
      throw error;
    }
    log.error("streamAIResponse failed, using fallback", error);
    const message = buildFallbackMessage(messages);
    for (const tokenChunk of chunkText(message)) {
      callbacks.onToken(tokenChunk);
    }
    return { message, ...buildRelated(query) };
  }
}

function chunkText(text: string, size = 4): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}
