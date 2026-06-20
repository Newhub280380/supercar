import type { ContentTemplateType, ContentTone, ContentPlatform, ContentType } from "@/types";
import { procedures } from "./knowledge-base";

export interface ContentTemplate {
  id: ContentTemplateType;
  label: string;
  contentType: ContentType;
  description: string;
  promptBuilder: (params: TemplateParams) => string;
}

export interface TemplateParams {
  topic: string;
  audience?: string;
  tone: ContentTone;
  length: "short" | "medium" | "long";
  platform: ContentPlatform;
  service?: string;
  seoKeywords?: string[];
}

const toneInstructions: Record<ContentTone, string> = {
  professional:
    "Напиши в профессиональном, экспертном стиле. Используй точную терминологию, но будь понятен для широкой аудитории. Обращайся уважительно. Без лишних эмодзи.",
  friendly:
    "Напиши в тёплом, дружеском стиле. Обращайся на «вы», но с теплотой. Можно использовать 2-3 эмодзи. Пиши как эксперт-бьюти блогер, который делится секретами красоты.",
  entertaining:
    "Напиши в лёгком, развлекательном стиле. Добавь юмор, креативные обороты, 3-5 эмодзи. Сделай так, чтобы текст хотелось дочитать до конца.",
};

const platformConstraints: Record<ContentPlatform, string> = {
  instagram:
    "Платформа: Instagram. Используй короткие параграфы, списки с эмодзи-буллетами. Добавь призыв к действию в конце (запись на процедуру, переход в Direct). Ограничение — до 2200 символов рекомендуется.",
  telegram:
    "Платформа: Telegram. Можно текст средней длины, форматирование с жирным шрифтом (**текст**). Используй абзацы. Можно призыв к действию с кнопкой (упомяни ссылку в описании).",
  vk:
    "Платформа: ВКонтакте. Используй структурированный текст с разделителями. Можно чуть длиннее, чем в Instagram. Обязательно хештеги. Призыв к действию — запись или комментарий.",
};

const lengthMap: Record<string, string> = {
  short: "Длина: 100-150 слов. Кратко и по сути.",
  medium: "Длина: 200-300 слов. Раскрой тему, но не перегружай.",
  long: "Длина: 400-500 слов. Подробный текст с примерами и деталями.",
};

export const contentTemplates: ContentTemplate[] = [
  {
    id: "promotion",
    label: "Акция / Скидка",
    contentType: "post",
    description: "Привлекающий пост о скидке или специальном предложении",
    promptBuilder: ({ topic, audience, tone, length, platform }) =>
      `${toneInstructions[tone]}

${platformConstraints[platform]}

${lengthMap[length]}

Создай пост-акцию для косметологического салона или частного косметолога.

Тема акции: ${topic}
${audience ? `Целевая аудитория: ${audience}` : "Целевая аудитория: женщины 25-45 лет, интересующиеся уходом за собой."}

Требования к посту:
1. Яркий заголовок с упоминанием выгоды (например, «Скидка 30% на первую процедуру!»)
2. Описание, что включено в акцию
3. Ограничение по времени (создай ощущение срочности)
4. Призыв к действию: записаться сейчас
5. Добавь 5-8 хештегов, релевантных акции и платформе

Формат: заголовок, основной текст, призыв к действию, хештеги.`,
  },
  {
    id: "new_procedure",
    label: "Новая процедура",
    contentType: "post",
    description: "Анонс новой процедуры или услуги",
    promptBuilder: ({ topic, audience, tone, length, platform, service }) =>
      `${toneInstructions[tone]}

${platformConstraints[platform]}

${lengthMap[length]}

Создай пост об анонсе новой процедуры.

Новая процедура: ${service || topic}
Описание процедуры: ${topic}
${audience ? `Для кого: ${audience}` : "Для всех, кто хочет улучшить состояние кожи и выглядеть молодо."}

Требования:
1. Интригующий заголовок (например, «Встречайте новую процедуру в нашем кабинете!»)
2. Что это за процедура и как она работает (2-3 предложения)
3. Какие проблемы решает (список)
4. Длительность и комфортность процедуры
5. Специальная цена для первых 10 записавшихся
6. Призыв к действию: записаться или задать вопрос
7. 8-10 хештегов

Формат: заголовок, описание, показания, специальная цена, призыв, хештеги.`,
  },
  {
    id: "review",
    label: "Отзыв / Кейс",
    contentType: "post",
    description: "Публикация отзыва клиента или кейса до/после",
    promptBuilder: ({ topic, audience, tone, length, platform }) =>
      `${toneInstructions[tone]}

${platformConstraints[platform]}

${lengthMap[length]}

Создай пост-отзыв или кейс от косметолога.

Тема: ${topic}
${audience ? `Аудитория: ${audience}` : "Аудитория: потенциальные клиенты."}

Требования:
1. Заголовок (например, «Результат за 3 процедуры» или «Что говорит наш клиент: отзыв о биоревитализации»)
2. Описание проблемы/запроса клиента
3. Что было сделано (процедура, курс)
4. Результат (с конкретикой, но без обещаний «вечной молодости»)
5. Эмоциональная составляющая — как изменилось ощущение клиента
6. Призыв к действию — записаться на консультацию
7. Дисклеймер: «Индивидуальные результаты могут отличаться»
8. 7-10 хештегов

Формат: заголовок, история клиента, процедура, результат, призыв.`,
  },
  {
    id: "care_tips",
    label: "Советы по уходу",
    contentType: "post",
    description: "Полезные советы по уходу за кожей",
    promptBuilder: ({ topic, audience, tone, length, platform }) => {
      const seasonalContext = getSeasonalContext();
      return `${toneInstructions[tone]}

${platformConstraints[platform]}

${lengthMap[length]}

Создай полезный пост-совет по уходу за кожей.

Тема: ${topic}
${audience ? `Для кого: ${audience}` : "Широкая аудитория, интересующаяся уходом за кожей."}
Сезонность: ${seasonalContext}

Требования:
1. Привлекающий заголовок (например, «5 правил ухода за кожей зимой» или «3 ошибки в уходе, которые старят»)
2. Структурированный список советов (3-7 пунктов)
3. Для каждого совета — краткое пояснение и практическая рекомендация
4. Упомяни 1-2 релевантные процедуры из базы знаний: ${procedures.slice(0, 3).map((p) => p.name).join(", ")}
5. Предупреждение о том, что важно проконсультироваться со специалистом
6. Призыв: подписаться на аккаунт для большего числа советов
7. 8-12 хештегов

Формат: заголовок, вступление, список советов, итоговый совет, призыв, хештеги.`;
    },
  },
  {
    id: "seasonal",
    label: "Сезонное предложение",
    contentType: "post",
    description: "Сезонный или праздничный пост с предложением",
    promptBuilder: ({ topic, audience, tone, length, platform }) => {
      const season = getCurrentSeasonName();
      return `${toneInstructions[tone]}

${platformConstraints[platform]}

${lengthMap[length]}

Создай сезонный/праздничный пост для косметолога.

Сезон: ${season}
Тема: ${topic}
${audience ? `Аудитория: ${audience}` : "Женщины 25-50 лет, заботящиеся о себе."}

Требования:
1. Сезонное вступление (например, «Готовимся к лету!», «Зимний уход — наш приоритет»)
2. Подборка процедур, актуальных для этого сезона (3-5 из базы знаний)
3. Специальное сезонное предложение (скидка, подарок при курсе)
4. Почему именно сейчас (обоснование сезонности)
5. Призыв к действию с ограничением по времени
6. 8-12 сезонных хештегов

Формат: заголовок, сезонное вступление, подборка процедур, предложение, призыв.`;
    },
  },
  {
    id: "seo_description",
    label: "SEO-описание услуги",
    contentType: "seo",
    description: "SEO-оптимизированное описание услуги для сайта",
    promptBuilder: ({ topic, tone, length, service, seoKeywords }) =>
      `${toneInstructions[tone]}

Создай SEO-оптимизированное описание услуги для сайта косметолога.

Услуга: ${service || topic}
Детали: ${topic}
${seoKeywords ? `Ключевые слова: ${seoKeywords.join(", ")}` : "Подбери релевантные ключевые слова самостоятельно."}
${lengthMap[length]}

Требования:
1. Заголовок H1: название услуги с главным ключом
2. Первый абзац: краткое описание с ключевым словом (до 160 символов — для meta-description)
3. Основной текст с подзаголовками H2
4. Что включает процедура (список)
5. Показания к процедуре
6. Противопоказания
7. Длительность и стоимость (без точных цен — «от X рублей»)
8. FAQ раздел: 3-5 вопросов и ответов
9. Призыв к действию: записаться на консультацию
10. Используй ключевые слова естественно, без переспама

Формат: H1, описание, H2-секции, FAQ, CTA.`,
  },
  {
    id: "email_welcome",
    label: "Welcome-письмо",
    contentType: "email",
    description: "Приветственное письмо для новой подписчицы",
    promptBuilder: ({ topic, tone, length, audience }) =>
      `${toneInstructions[tone]}

Создай welcome-письмо для новой подписчицы косметолога.

Тема: ${topic || "Приветствие нового клиента"}
${audience ? `Аудитория: ${audience}` : "Новая подписчица, которая только зарегистрировалась."}
${lengthMap[length]}

Требования:
1. Тема письма (Subject Line): привлекающая, но не кликбейт. До 60 символов.
2. Прехедер: краткое сопровождение (до 90 символов).
3. Приветствие с обращением по имени (используй шаблон {Имя}).
4. Краткая история/знакомство: кто ты, что делаешь.
5. Что получит подписчица: бонус, скидка, полезный контент.
6. 3 самых популярных услуги с кратким описанием.
7. Призыв к действию: записаться на первую процедуру со скидкой.
8. Подпись с контактами.

Формат: Subject, прехедер, приветствие, знакомство, бонус, услуги, CTA, подпись.`,
  },
  {
    id: "email_reminder",
    label: "Напоминание о записи",
    contentType: "email",
    description: "Email-напоминание о предстоящей записи",
    promptBuilder: ({ topic, tone, length, service }) =>
      `${toneInstructions[tone]}

Создай письмо-напоминание о предстоящей записи к косметологу.

Услуга: ${service || "процедура"}
Детали: ${topic}
${lengthMap[length]}

Требования:
1. Subject Line: «Напоминаем о вашей записи» + вариации
2. Дата и время записи (используй {Дата} и {Время} как шаблоны)
3. Название процедуры — {Услуга}
4. Краткие рекомендации по подготовке к процедуре (3-5 пунктов)
5. Адрес и контакты клиники
6. Инструкция, как отменить или перенести запись
7. Призыв подтвердить запись

Формат: Subject, приветствие, детали записи, подготовка, контакты, CTA.`,
  },
  {
    id: "email_promo",
    label: "Акция по Email",
    contentType: "email",
    description: "Email-рассылка о текущей акции",
    promptBuilder: ({ topic, tone, length, audience, platform: _platform }) =>
      `${toneInstructions[tone]}

Создай email-рассылку о текущей акции для клиентов косметолога.

Акция: ${topic}
${audience ? `Аудитория: ${audience}` : "Существующие клиенты."}
${lengthMap[length]}

Требования:
1. Subject Line: с упоминанием выгоды и срочности. Не более 60 символов.
2. Прехедер: поддерживающая строка.
3. Приветствие с {Имя}.
4. Описание акции: что, кому, на каких условиях.
5. Срок действия (ограничение по времени).
6. Список процедур, участвующих в акции (3-5).
7. Призыв к действию с кнопкой «Записаться».
8. P.S. с дополнительным бонусом.
9. Подпись и контакты.

Формат: Subject, прехедер, вступление, акция, список процедур, CTA, P.S., подпись.`,
  },
  {
    id: "hashtags",
    label: "Хештег-генератор",
    contentType: "hashtags",
    description: "Набор хештегов для поста или аккаунта",
    promptBuilder: ({ topic, platform, service }) =>
      `Создай набор хештегов для платформы ${platform} для косметолога.

Тема: ${topic}
${service ? `Услуга: ${service}` : ""}

Требования:
1. Создай 4 группы хештегов:
   - Популярные (высокочастотные): 5-7 хештегов
   - Средние (среднечастотные): 7-10 хештегов
   - Нишевые (узкоспециализированные): 5-7 хештегов
   - Локальные (если бы это был город): 3-5 хештегов с #косметолог #салонкрасоты и подобным
2. Все хештеги на русском языке
3. Учитывай особенности платформы ${platform}
4. Хештеги должны быть актуальными для косметологии и бьюти-индустрии
5. Не создавай хештеги, которые могут быть заблокированы

Для Instagram: до 30 хештегов в целом
Для Telegram: 3-5 хештегов
Для VK: 5-10 хештегов`,
  },
];

function getSeasonalContext(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Весна — сезон обновления, подготовки к лету, витаминов.";
  if (month >= 5 && month <= 7) return "Лето — защита от солнца, лёгкие процедуры, уход за телом.";
  if (month >= 8 && month <= 10) return "Осень — восстановление после лета, пилинги, увлажнение.";
  return "Зима — защита от холода, питание кожи, увлажнение, новогодние процедуры.";
}

function getCurrentSeasonName(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Весна";
  if (month >= 5 && month <= 7) return "Лето";
  if (month >= 8 && month <= 10) return "Осень";
  return "Зима";
}

export function getTemplate(id: ContentTemplateType): ContentTemplate {
  const template = contentTemplates.find((t) => t.id === id);
  if (!template) throw new Error(`Template not found: ${id}`);
  return template;
}

export function buildGeneratorPrompt(
  template: ContentTemplate,
  params: Omit<TemplateParams, "platform">,
): string {
  return template.promptBuilder({ ...params, platform: "instagram" } as TemplateParams);
}

export const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  vk: "ВКонтакте",
};

export const TEMPLATE_LABELS: Record<ContentTemplateType, string> = {
  promotion: "Акция",
  new_procedure: "Новая процедура",
  review: "Отзыв клиента",
  care_tips: "Советы по уходу",
  seasonal: "Сезонное предложение",
  seo_description: "SEO-описание",
  email_welcome: "Welcome-письмо",
  email_reminder: "Напоминание",
  email_promo: "Акция по email",
  hashtags: "Хештеги",
};

export const TONE_LABELS: Record<ContentTone, string> = {
  professional: "Профессиональный",
  friendly: "Дружеский",
  entertaining: "Развлекательный",
};
