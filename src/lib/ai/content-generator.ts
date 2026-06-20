import type {
  ContentGenerationRequest,
  ContentGenerationResult,
  ContentPlatform,
  ContentTemplateType,
} from "@/types";
import { getTemplate } from "./content-templates";
import { procedures } from "./knowledge-base";

interface OpenAIChatResponse {
  choices: { message: { content: string | null } }[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

const CONTENT_RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_CONTENT_REQUESTS = 20;
const contentRateLimitMap = new Map<string, number[]>();

export function checkContentRateLimit(userId: string): boolean {
  const now = Date.now();
  const requests = contentRateLimitMap.get(userId) ?? [];
  const recent = requests.filter((t) => now - t < CONTENT_RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_CONTENT_REQUESTS) return false;
  recent.push(now);
  contentRateLimitMap.set(userId, recent);
  return true;
}

async function callOpenAIForContent(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackContent(systemPrompt);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты опытный SMM-менеджер и копирайтер для косметологической индустрии. Создаёшь качественный маркетинговый контент, который привлекает клиентов. Отвечай только на русском языке. Используй базу знаний о процедурах для точности.`,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  return data.choices[0]?.message?.content ?? buildFallbackContent(userPrompt);
}

function buildFallbackContent(prompt: string): string {
  const procExamples = procedures.slice(0, 3);

  const isEmail = /email|письм/i.test(prompt);
  const isHashtag = /хештег|hashtag/i.test(prompt);
  const isSeo = /SEO/i.test(prompt);

  if (isHashtag) {
    return `#косметолог #косметология #уходзалицом #процедуры #красота
#инъекциикрасоты #биоревитализация #пилинг #филлеры #ботокс
#молокосметолог #салонкрасоты #антиэйдж #омоложение`;
  }

  if (isSeo) {
    return `# ${procExamples[0].name}

${procExamples[0].description}

## Показания к процедуре

${procExamples[0].indications.join(", ")}

## Как проходит процедура

Длительность: ${procExamples[0].duration}. Восстановление: ${procExamples[0].recovery}. Подходит для типов кожи: ${procExamples[0].suitableFor.join(", ")}.

## Противопоказания

${procExamples[0].contraindications.join(", ")}

## Стоимость

Стоимость процедуры — от ${procExamples[0].priceRange}. Точная цена определяется на консультации.

## FAQ

### Сколько процедур нужно?
Количество процедур определяется индивидуально на консультации.

### Как подготовиться?
За 2 недели до процедуры избегайте загара и ретиноидов.

### Когда виден результат?
Первые результаты видны сразу, окончательный эффект — через 7-14 дней.

Запишитесь на консультацию прямо сейчас!`;
  }

  if (isEmail) {
    return `Subject: ✨ Специальное предложение для вас

Здравствуйте, {Имя}!

Рады приветствовать вас! Мы подготовили для вас особенное предложение.

**Наши популярные процедуры:**
${procExamples.map((p) => `• **${p.name}** — ${p.description.slice(0, 60)}... Цена: ${p.priceRange}`).join("\n")}

Не упустите возможность записаться на первую процедуру со скидкой 20%!
Акция действует до конца месяца.

Записаться →

P.S. При первом визите — бесплатная консультация косметолога.

С любовью,
Ваш косметолог`;
  }

  return `✨ ${procExamples[0].name} — ваша кожа заслуживает лучшего!

Каждая женщина мечтает о сияющей, здоровой коже. ${procExamples[0].name} — это процедура, которая поможет вам достичь этой цели.

${procExamples[0].description}

Что вас ждёт:
• Длительность — ${procExamples[0].duration}
• Комфорт и безопасность
• Видимый результат уже после первой процедуры

🎁 Специальное предложение для новых клиентов — скидка 20% на первое посещение!
Запись по ссылке или в Direct.

#косметолог #косметология #биоревитализация #уходзалицом #красота #салонкрасоты

*Индивидуальные результаты могут отличаться. Требуется консультация специалиста.*`;
}

function parseResult(content: string, templateType: ContentTemplateType, _platform: ContentPlatform): ContentGenerationResult {
  const hashtagRegex = /#[^\s#]+/g;
  const hashtags = content.match(hashtagRegex) ?? [];
  const uniqueHashtags = Array.from(new Set(hashtags));

  const subjectMatch = content.match(/^(?:Subject|Тема)[:\s]+(.+)$/im);
  const subjectLine = subjectMatch?.[1]?.trim();

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim();

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const metaKeywords = extractSeoKeywords(content);

  return {
    title: title ?? undefined,
    content,
    hashtags: uniqueHashtags.length > 0 ? uniqueHashtags : undefined,
    subjectLine,
    metaDescription: templateType === "seo_description" ? content.split("\n")[1]?.slice(0, 160) : undefined,
    seoKeywords: metaKeywords.length > 0 ? metaKeywords : undefined,
    wordCount,
  };
}

function extractSeoKeywords(text: string): string[] {
  const keywords: Set<string> = new Set();
  const cosmetologyTerms = [
    "косметолог", "косметология", "процедура", "кожа", "уход",
    "омоложение", "лицо", "инъекции", "филлеры", "биоревитализация",
    "пилинг", "ботокс", "мезотерапия", "чистка лица", "салон красоты",
  ];

  for (const term of cosmetologyTerms) {
    if (text.toLowerCase().includes(term)) {
      keywords.add(term);
    }
  }

  for (const proc of procedures) {
    if (text.toLowerCase().includes(proc.name.toLowerCase())) {
      keywords.add(proc.name.toLowerCase());
    }
  }

  return Array.from(keywords);
}

export async function generateContent(
  request: ContentGenerationRequest,
): Promise<ContentGenerationResult> {
  const { platform, templateType, topic, audience, tone, length = "medium", service, seoKeywords } = request;
  const template = getTemplate(templateType);

  const prompt = template.promptBuilder({
    topic,
    audience,
    tone,
    length,
    platform,
    service,
    seoKeywords,
  });

  const generatedContent = await callOpenAIForContent("", prompt);
  return parseResult(generatedContent, templateType, platform);
}

export function generateMockContent(
  request: ContentGenerationRequest,
): ContentGenerationResult {
  const { platform, templateType, topic, service } = request;
  void request;
  const procExamples = procedures.slice(0, 3);

  const contentMap: Record<ContentTemplateType, string> = {
    promotion: `🎉 СУПЕРАКЦИЯ! Скидка 30% до конца месяца!

${topic} — это ваш шанс попробовать наши лучшие процедуры по специальной цене.

✨ Что включено:
${procExamples.map((p) => `• ${p.name} — вместо ${p.priceRange.split("–")[0]?.trim()} руб. всего за ${Math.round(parseInt((p.priceRange.split("–")[0] ?? "5000").replace(/\s/g, "")) * 0.7).toLocaleString("ru-RU")} руб.`).join("\n")}

⏰ Предложение ограничено — успейте записаться!

Запись: DM или по ссылке в профиле.

#акция #скидки #косметолог #косметология #красота #уходзалицом #спецпредложение #салонкрасоты`,

    new_procedure: `🌟 Встречайте! Новая процедура в нашем кабинете — ${service || topic}

${topic}

Что даёт процедура:
• Заметное улучшение состояния кожи
• Безопасность и комфорт
• Результат уже после первого визита

📅 Длительность: 40-60 минут
💎 Специальная цена для первых 10 записей — от 5 000 ₽

Запишитесь на бесплатную консультацию, чтобы узнать, подходит ли вам эта процедура!

#новаяпроцедура #косметология #омоложение #уходзалицом #красота #салонкрасоты #косметолог #процедурылица`,

    review: `💬 Отзыв нашей клиентки

"${topic}"

Проблема: ${topic}
Решение: курс из 3 процедур
Результат: заметное улучшение качества кожи

Процедура, которая помогла: ${procExamples[0].name}
Длительность курса: 1 месяц

Клиентка отмечает:
• Выровнялся тон кожи
• Уменьшилась сухость
• Появилось сияние

✨ Результаты могут отличаться. Рекомендуем консультацию специалиста для индивидуального плана.

#отзыв #результат #косметология #доипосле #уходзалицом #красота #косметолог #кейс`,

    care_tips: `📋 5 правил ухода за кожей, которые изменят всё

1. Очищение — основа всего
Начинайте с мягкого очищения утром и вечером. Гель или мицеллярная вода — ваши лучшие друзья.

2. SPF — ежедневно, круглый год
Даже зимой. Даже дома у окна. SPF 30+ минимум.

3. Увлажнение — не только снаружи
Пейте воду. Используйте увлажняющий крем с гиалуроновой кислотой.

4. Не пренебрегайте шеей и руками
Кожа шеи и рук выдаёт возраст первой. Ухаживайте за ними так же, как за лицом.

5. Профессиональный уход — обязательно
Домашний уход + процедуры у косметолога (например, ${procExamples[0].name}) = максимум результата.

💡 Совет: записывайтесь на консультацию раз в 3 месяца для коррекции плана ухода.

Подписывайтесь — тут ещё больше полезных советов! 🌸

#уходзалицом #советыкосметолога #красота #skincare #уходзасобой #косметология #косметолог #beauty #здороваякожа #tips`,

    seasonal: `🌸 Готовимся к новому сезону!

Зима — идеальное время для восстановления и подготовки кожи к обновлению.

Наши рекомендованные процедуры:
${procExamples.map((p) => `• ${p.name} — ${p.description.slice(0, 60)}...`).join("\n")}

🎁 Специальное зимнее предложение:
При записи на курс из 3 процедур — 4-я в подарок!

Почему именно сейчас?
• Отсутствие активного солнца — минимум риска пигментации
• Кожа нуждается в восстановлении после холодов
• Лучшие результаты при курсовом подходе

Записывайтесь — количество мест ограничено!

#зимнийуход #косметология #салонкрасоты #акция #уходзалицом #косметолог #красота #омоложение #пилингзимой`,

    seo_description: `# ${service || topic} — профессиональная процедура для вашей кожи

${topic} — одна из самых востребованных процедур в современной косметологии. Доверьтесь профессионалам для достижения максимального результата.

## О процедуре

${service || topic} — это эффективный метод улучшения качества кожи, который подходит для большинства типов кожи. Процедура проводится сертифицированными специалистами с использованием профессиональных препаратов.

## Показания

• Возрастные изменения кожи
• Потеря тонуса и упругости
• Тусклый цвет лица
• Подготовка к особым событиям

## Противопоказания

• Беременность и период лактации
• Острые воспалительные заболевания
• Индивидуальная непереносимость компонентов

## Стоимость

Цена процедуры — от 5 000 ₽. Точная стоимость рассчитывается на консультации.

## FAQ

### Сколько процедур необходимо?
Оптимальный курс — 3-5 процедур с интервалом 2-4 недели.

### Есть ли период восстановления?
В большинстве случаев восстановление занимает 1-3 дня.

### Как записаться?
Заполните форму на сайте или позвоните по телефону.`.trim(),

    email_welcome: `Subject: ✨ Добро пожаловать! Ваш подарок уже ждёт

Здравствуйте, {Имя}!

Рады видеть вас среди наших клиентов! Позвольте представиться — мы команда профессиональных косметологов, и наша миссия — помочь вам выглядеть и чувствовать себя великолепно.

🎁 Ваш подарок: скидка 20% на первую процедуру. Используйте код WELCOME20 при записи.

Наши самые популярные процедуры:
${procExamples.map((p) => `• **${p.name}** — ${p.description.slice(0, 50)}... ${p.priceRange}`).join("\n")}

Записывайтесь на бесплатную консультацию — мы подберём идеальный уход именно для вас!

С теплом,
Ваш косметолог

P.S. Ответьте на это письмо — и получите дополнительные рекомендации по уходу за кожей.`,

    email_reminder: `Subject: ⏰ Напоминаем о вашей записи

Здравствуйте, {Имя}!

Напоминаем, что у вас запланирована запись:

📅 Дата: {Дата}
🕐 Время: {Время}
💎 Процедура: ${service || topic}

Как подготовиться:
• Не используйте ретиноиды за 3 дня до процедуры
• Не загорайте за 2 недели
• Не употребляйте алкоголь за сутки
• Приходите без макияжа
• Возьмите с собой паспорт

📍 Адрес: ул. Примерная, д. 1
📞 Телефон: +7 (XXX) XXX-XX-XX

Если нужно отменить или перенести — напишите нам или позвоните за 24 часа.

Подтвердите запись, ответив на это письмо!

До встречи!`,

    email_promo: `Subject: 🔥 Только до конца месяца — скидка 25%!

Здравствуйте, {Имя}!

${topic}

Вот что вас ждёт:
${procExamples.map((p) => `• ${p.name} — ${Math.round(parseInt((p.priceRange.split("–")[0] ?? "5000").replace(/\s/g, "")) * 0.75).toLocaleString("ru-RU")} ₽ (вместо ${p.priceRange.split("–")[0]?.trim()} ₽)`).join("\n")}

⏰ Срок акции: до {Дата}

Записаться →

P.S. Приведите подругу — и обе получите ещё одну процедуру в подарок!

С любовью,
Ваш косметолог`,

    hashtags: `#косметолог #косметология #уходзалицом #красота #салонкрасоты
#инъекциикрасоты #биоревитализация #пилинг #омоложение #ботокс
#процедурылица #beauty #skincare #красиваякожа #эстетика
#антиэйдж #здороваякожа #лицо #женскаякрасота #бьютисоветы`,
  };

  const content = contentMap[templateType] || contentMap.promotion;

  return parseResult(content, templateType, platform);
}
