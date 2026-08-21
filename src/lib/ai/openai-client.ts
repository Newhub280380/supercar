import OpenAI from "openai";
import { logger } from "@/lib/logger";

export const DEFAULT_MODEL = "gpt-4o";

export function getModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

export function isAIEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  client = new OpenAI({
    apiKey,
    timeout: Number(process.env.OPENAI_TIMEOUT_MS) || 30_000,
    maxRetries: 2,
  });

  return client;
}

export function resetOpenAIClient(): void {
  client = null;
}

export interface ChatCompletionParams {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export async function createChatCompletion(
  params: ChatCompletionParams,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const openai = getOpenAIClient();
  const model = params.model || getModel();
  const log = logger.scope("openai");

  log.debug("chat completion request", {
    model,
    messageCount: params.messages.length,
  });

  try {
    const completion = await openai.chat.completions.create(
      {
        model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 1024,
        stream: false,
      },
      { signal: params.signal },
    );

    log.debug("chat completion response", {
      model,
      finishReason: completion.choices[0]?.finish_reason,
      usage: completion.usage,
    });

    return completion;
  } catch (error) {
    log.error("chat completion failed", error);
    throw error;
  }
}

export async function streamChatCompletion(
  params: ChatCompletionParams,
  onToken: (token: string) => void,
): Promise<{
  content: string;
  finishReason: string | null;
  usage: OpenAI.Chat.Completions.ChatCompletion["usage"] | null;
}> {
  const openai = getOpenAIClient();
  const model = params.model || getModel();
  const log = logger.scope("openai");

  log.debug("streaming chat completion request", {
    model,
    messageCount: params.messages.length,
  });

  let content = "";
  let finishReason: string | null = null;
  let usage: OpenAI.Chat.Completions.ChatCompletion["usage"] | null = null;

  try {
    const stream = await openai.chat.completions.create(
      {
        model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 1024,
        stream: true,
        stream_options: { include_usage: true },
      },
      { signal: params.signal },
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        content += delta;
        onToken(delta);
      }
      const reason = chunk.choices[0]?.finish_reason;
      if (reason) {
        finishReason = reason;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
    }

    log.debug("streaming chat completion finished", {
      model,
      finishReason,
      chars: content.length,
      usage,
    });

    return { content, finishReason, usage };
  } catch (error) {
    log.error("streaming chat completion failed", error);
    throw error;
  }
}

export function extractReply(
  completion: OpenAI.Chat.Completions.ChatCompletion,
): string {
  const choice = completion.choices[0];
  const content = choice?.message?.content;
  if (typeof content === "string" && content.length > 0) return content;
  return "Извините, произошла ошибка при обработке ответа.";
}
