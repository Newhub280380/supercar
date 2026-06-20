import { NextRequest, NextResponse } from "next/server";
import { generateContent, generateMockContent, checkContentRateLimit } from "@/lib/ai/content-generator";
import type { ContentGenerationRequest, ContentPlatform, ContentTemplateType, ContentTone } from "@/types";

const VALID_PLATFORMS: ContentPlatform[] = ["instagram", "telegram", "vk"];
const VALID_TEMPLATE_TYPES: ContentTemplateType[] = [
  "promotion",
  "new_procedure",
  "review",
  "care_tips",
  "seasonal",
  "seo_description",
  "email_welcome",
  "email_reminder",
  "email_promo",
  "hashtags",
];
const VALID_TONES: ContentTone[] = ["professional", "friendly", "entertaining"];

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "anonymous";

    if (!checkContentRateLimit(userId)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Подождите минуту." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const {
      platform,
      templateType,
      topic,
      audience,
      tone = "professional",
      length = "medium",
      service,
      seoKeywords,
    } = body as ContentGenerationRequest;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: "Укажите платформу: instagram, telegram или vk" },
        { status: 400 },
      );
    }

    if (!templateType || !VALID_TEMPLATE_TYPES.includes(templateType)) {
      return NextResponse.json(
        { error: "Укажите корректный тип шаблона" },
        { status: 400 },
      );
    }

    if (!topic?.trim()) {
      return NextResponse.json(
        { error: "Укажите тему контента" },
        { status: 400 },
      );
    }

    if (!VALID_TONES.includes(tone)) {
      return NextResponse.json(
        { error: "Укажите корректный тон: professional, friendly или entertaining" },
        { status: 400 },
      );
    }

    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    const result = hasOpenAIKey
      ? await generateContent(
          { platform, templateType, topic, audience, tone, length, service, seoKeywords },
        )
      : generateMockContent({ platform, templateType, topic, audience, tone, length, service });

    return NextResponse.json({
      ...result,
      isDemo: !hasOpenAIKey,
      settings: { platform, templateType, topic, tone, length },
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации контента" },
      { status: 500 },
    );
  }
}
