import type {
  EmailCampaignStatus,
  SmsCampaignStatus,
  SubscriberStatus,
  AbTestStatus,
  ConversionGoalType,
} from "@/types";

export interface SeoPageItem {
  id: string;
  pageUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string | null;
  hasTitle: boolean;
  hasDescription: boolean;
  hasKeywords: boolean;
  titleLength: number;
  descriptionLength: number;
}

export interface SubscriberListItem {
  id: string;
  name: string;
  description: string | null;
  subscriberCount: number;
  createdAt: string;
}

export interface SubscriberItem {
  id: string;
  listId: string;
  listName: string;
  email: string;
  name: string;
  phone: string;
  status: SubscriberStatus;
  subscribedAt: string;
}

export interface EmailCampaignItem {
  id: string;
  subject: string;
  content: string;
  templateName: string | null;
  listName: string;
  status: EmailCampaignStatus;
  recipientCount: number;
  sentAt: string | null;
  scheduledAt: string | null;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
  } | null;
  createdAt: string;
}

export interface SmsCampaignItem {
  id: string;
  name: string;
  content: string;
  type: "notification" | "reminder" | "promotion";
  status: SmsCampaignStatus;
  recipientCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  metrics: {
    sent: number;
    delivered: number;
    failed: number;
  } | null;
  createdAt: string;
}

export interface UtmCampaignItem {
  id: string;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  landingUrl: string;
  generatedUrl: string;
  clickCount: number;
  conversionCount: number;
  createdAt: string;
}

export interface AbTestItem {
  id: string;
  name: string;
  campaignName: string;
  variantASubject: string;
  variantBSubject: string;
  status: AbTestStatus;
  variantAMetrics: { sent: number; opened: number; clicked: number } | null;
  variantBMetrics: { sent: number; opened: number; clicked: number } | null;
  winner: string | null;
  startedAt: string | null;
  createdAt: string;
}

export interface ConversionGoalItem {
  id: string;
  name: string;
  type: ConversionGoalType;
  totalAttempts: number;
  totalCompleted: number;
  conversionRate: number;
  trend: number;
  createdAt: string;
}

export const seoPagesData: SeoPageItem[] = [
  {
    id: "seo-1",
    pageUrl: "/",
    metaTitle: "AI Платформа для косметологов — CRM, запись, аналитика",
    metaDescription: "Полнофункциональная AI-платформа для косметологов. Управление записями, CRM, AI-консультант, SMM-генератор и аналитика в одном месте.",
    keywords: "косметология, AI, CRM, запись, платформа",
    ogImage: null,
    hasTitle: true,
    hasDescription: true,
    hasKeywords: true,
    titleLength: 48,
    descriptionLength: 120,
  },
  {
    id: "seo-2",
    pageUrl: "/about",
    metaTitle: "О платформе — AI Cosmetology",
    metaDescription: "Узнайте о возможностях AI-платформы для косметологов.",
    keywords: "о платформе, возможности",
    ogImage: null,
    hasTitle: true,
    hasDescription: true,
    hasKeywords: true,
    titleLength: 33,
    descriptionLength: 55,
  },
  {
    id: "seo-3",
    pageUrl: "/pricing",
    metaTitle: "Тарифы — AI Cosmetology Platform",
    metaDescription: "Выберите подходящий тариф: Free, Pro или Business. Гибкие условия для любого масштаба бизнеса.",
    keywords: "тарифы, цены, подписка",
    ogImage: null,
    hasTitle: true,
    hasDescription: true,
    hasKeywords: true,
    titleLength: 36,
    descriptionLength: 100,
  },
  {
    id: "seo-4",
    pageUrl: "/contact",
    metaTitle: "Контакты",
    metaDescription: "",
    keywords: "",
    ogImage: null,
    hasTitle: true,
    hasDescription: false,
    hasKeywords: false,
    titleLength: 10,
    descriptionLength: 0,
  },
  {
    id: "seo-5",
    pageUrl: "/dashboard",
    metaTitle: "",
    metaDescription: "Дашборд косметолога — управление записями и клиентами.",
    keywords: "дашборд, CRM",
    ogImage: null,
    hasTitle: false,
    hasDescription: true,
    hasKeywords: true,
    titleLength: 0,
    descriptionLength: 56,
  },
  {
    id: "seo-6",
    pageUrl: "/services/biorevitalization",
    metaTitle: "Биоревитализация — запись онлайн",
    metaDescription: "Запишитесь на биоревитализацию онлайн. Глубокое увлажнение кожи гиалуроновой кислотой. Цена от 12 000 ₽.",
    keywords: "биоревитализация, гиалуроновая кислота, увлажнение",
    ogImage: null,
    hasTitle: true,
    hasDescription: true,
    hasKeywords: true,
    titleLength: 34,
    descriptionLength: 105,
  },
  {
    id: "seo-7",
    pageUrl: "/services/chemical-peeling",
    metaTitle: "",
    metaDescription: "Химический пилинг для обновления кожи.",
    keywords: "",
    ogImage: null,
    hasTitle: false,
    hasDescription: true,
    hasKeywords: false,
    titleLength: 0,
    descriptionLength: 40,
  },
];

export const subscriberListsData: SubscriberListItem[] = [
  { id: "list-1", name: "Все клиенты", description: "Общий список всех подписчиков", subscriberCount: 48, createdAt: "2025-09-01" },
  { id: "list-2", name: "VIP клиенты", description: "Клиенты с premium-подпиской", subscriberCount: 12, createdAt: "2025-10-15" },
  { id: "list-3", name: "Новые клиенты", description: "Зарегистрировались за последний месяц", subscriberCount: 15, createdAt: "2026-01-01" },
  { id: "list-4", name: "Неактивные", description: "Не были более 60 дней", subscriberCount: 21, createdAt: "2026-02-10" },
];

export const subscribersData: SubscriberItem[] = [
  { id: "sub-1", listId: "list-1", listName: "Все клиенты", email: "anna.petrova@mail.ru", name: "Анна Петрова", phone: "+7 (903) 123-45-67", status: "active", subscribedAt: "2025-09-15" },
  { id: "sub-2", listId: "list-1", listName: "Все клиенты", email: "maria.ivanova@gmail.com", name: "Мария Иванова", phone: "+7 (915) 234-56-78", status: "active", subscribedAt: "2025-10-20" },
  { id: "sub-3", listId: "list-2", listName: "VIP клиенты", email: "elena.smirnova@yandex.ru", name: "Елена Смирнова", phone: "+7 (926) 345-67-89", status: "active", subscribedAt: "2025-09-01" },
  { id: "sub-4", listId: "list-1", listName: "Все клиенты", email: "olga.kozlova@mail.ru", name: "Ольга Козлова", phone: "+7 (905) 456-78-90", status: "unsubscribed", subscribedAt: "2025-11-05" },
  { id: "sub-5", listId: "list-3", listName: "Новые клиенты", email: "daria.morozova@mail.ru", name: "Дарья Морозова", phone: "+7 (917) 890-12-34", status: "active", subscribedAt: "2026-01-15" },
  { id: "sub-6", listId: "list-4", listName: "Неактивные", email: "svetlana.k@mail.ru", name: "Светлана Кузнецова", phone: "+7 (909) 901-23-45", status: "bounced", subscribedAt: "2025-12-01" },
  { id: "sub-7", listId: "list-2", listName: "VIP клиенты", email: "tatiana.sokolova@inbox.ru", name: "Татьяна Соколова", phone: "+7 (916) 567-89-01", status: "active", subscribedAt: "2025-09-10" },
  { id: "sub-8", listId: "list-3", listName: "Новые клиенты", email: "ludmila.belova@gmail.com", name: "Людмила Белова", phone: "+7 (912) 012-34-56", status: "active", subscribedAt: "2026-03-10" },
];

export const emailCampaignsData: EmailCampaignItem[] = [
  {
    id: "ec-1",
    subject: "Весенние скидки на косметологические процедуры!",
    content: "<h1>Весеннее обновление!</h1><p>Скидки до 30% на все инъекционные процедуры.</p>",
    templateName: "Сезонная акция",
    listName: "Все клиенты",
    status: "sent",
    recipientCount: 48,
    sentAt: "2026-03-15T10:00:00Z",
    scheduledAt: null,
    metrics: { sent: 48, opened: 35, clicked: 12, bounced: 2 },
    createdAt: "2026-03-10",
  },
  {
    id: "ec-2",
    subject: "Напоминание: ваш визит завтра",
    content: "<p>Напоминаем о записи завтра в 10:00. Биоревитализация.</p>",
    templateName: "Напоминание",
    listName: "VIP клиенты",
    status: "sent",
    recipientCount: 12,
    sentAt: "2026-06-19T08:00:00Z",
    scheduledAt: null,
    metrics: { sent: 12, opened: 10, clicked: 3, bounced: 0 },
    createdAt: "2026-06-18",
  },
  {
    id: "ec-3",
    subject: "Новая процедура: плазмолифтинг!",
    content: "<h1>Мы рады представить!</h1><p>Теперь в нашем центре доступна процедура плазмолифтинга.</p>",
    templateName: "Новая услуга",
    listName: "Все клиенты",
    status: "scheduled",
    recipientCount: 48,
    sentAt: null,
    scheduledAt: "2026-06-25T12:00:00Z",
    metrics: null,
    createdAt: "2026-06-18",
  },
  {
    id: "ec-4",
    subject: "Спасибо за визит! Поделитесь впечатлениями",
    content: "<p>Благодарим за посещение! Оставьте отзыв и получите скидку 10%.</p>",
    templateName: "Follow-up",
    listName: "Новые клиенты",
    status: "draft",
    recipientCount: 15,
    sentAt: null,
    scheduledAt: null,
    metrics: null,
    createdAt: "2026-06-15",
  },
  {
    id: "ec-5",
    subject: "Летние процедуры для сияющей кожи",
    content: "<h1>Лето — время заботиться о коже!</h1><p>Специальные летние уходы и пилинги.</p>",
    templateName: "Сезонная акция",
    listName: "Все клиенты",
    status: "sending",
    recipientCount: 48,
    sentAt: "2026-06-20T09:00:00Z",
    scheduledAt: null,
    metrics: { sent: 48, opened: 0, clicked: 0, bounced: 0 },
    createdAt: "2026-06-19",
  },
];

export const smsCampaignsData: SmsCampaignItem[] = [
  {
    id: "sms-1",
    name: "Напоминание о записи",
    content: "Здравствуйте, {name}! Напоминаем: запись на {service} завтра в {time}. Ждём вас!",
    type: "reminder",
    status: "sent",
    recipientCount: 5,
    sentAt: "2026-06-19T08:00:00Z",
    scheduledAt: null,
    metrics: { sent: 5, delivered: 5, failed: 0 },
    createdAt: "2026-06-18",
  },
  {
    id: "sms-2",
    name: "Акция: скидка 20% на пилинг",
    content: "Летняя акция! Скидка 20% на химический пилинг до конца июня. Запись: {url}",
    type: "promotion",
    status: "sent",
    recipientCount: 48,
    sentAt: "2026-06-10T12:00:00Z",
    scheduledAt: null,
    metrics: { sent: 48, delivered: 45, failed: 3 },
    createdAt: "2026-06-08",
  },
  {
    id: "sms-3",
    name: "Благодарность за визит",
    content: "Спасибо за визит, {name}! Будем рады видеть вас снова. Запись по телефону: {phone}",
    type: "notification",
    status: "draft",
    recipientCount: 0,
    sentAt: null,
    scheduledAt: null,
    metrics: null,
    createdAt: "2026-06-17",
  },
  {
    id: "sms-4",
    name: "Новая услуга — ботокс",
    content: "Новинка! Ботокс от лучших специалистов. Запишитесь сегодня: {url}",
    type: "promotion",
    status: "scheduled",
    recipientCount: 48,
    sentAt: null,
    scheduledAt: "2026-06-28T10:00:00Z",
    metrics: null,
    createdAt: "2026-06-16",
  },
];

export const utmCampaignsData: UtmCampaignItem[] = [
  {
    id: "utm-1",
    name: "Instagram Весенняя акция",
    source: "instagram",
    medium: "social",
    campaign: "spring_sale_2026",
    landingUrl: "/pricing",
    generatedUrl: "https://example.com/pricing?utm_source=instagram&utm_medium=social&utm_campaign=spring_sale_2026",
    clickCount: 234,
    conversionCount: 18,
    createdAt: "2026-03-01",
  },
  {
    id: "utm-2",
    name: "VK Рассылка биоревитализация",
    source: "vk",
    medium: "email",
    campaign: "bio_rev_mailing",
    landingUrl: "/services/biorevitalization",
    generatedUrl: "https://example.com/services/biorevitalization?utm_source=vk&utm_medium=email&utm_campaign=bio_rev_mailing",
    clickCount: 156,
    conversionCount: 12,
    createdAt: "2026-04-10",
  },
  {
    id: "utm-3",
    name: "Telegram Канал — Новая услуга",
    source: "telegram",
    medium: "social",
    campaign: "new_plasmolifting",
    landingUrl: "/services/plasmolifting",
    generatedUrl: "https://example.com/services/plasmolifting?utm_source=telegram&utm_medium=social&utm_campaign=new_plasmolifting",
    clickCount: 89,
    conversionCount: 7,
    createdAt: "2026-05-20",
  },
  {
    id: "utm-4",
    name: "Google Ads — Лазерная эпиляция",
    source: "google",
    medium: "cpc",
    campaign: "laser_epilation",
    landingUrl: "/services/laser",
    generatedUrl: "https://example.com/services/laser?utm_source=google&utm_medium=cpc&utm_campaign=laser_epilation",
    clickCount: 567,
    conversionCount: 42,
    createdAt: "2026-02-15",
  },
  {
    id: "utm-5",
    name: "Email рассылка — Летние скидки",
    source: "newsletter",
    medium: "email",
    campaign: "summer_discounts",
    landingUrl: "/pricing",
    generatedUrl: "https://example.com/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=summer_discounts",
    clickCount: 312,
    conversionCount: 28,
    createdAt: "2026-06-01",
  },
];

export const abTestsData: AbTestItem[] = [
  {
    id: "abt-1",
    name: "Скидки — заголовок A/B",
    campaignName: "Весенние скидки",
    variantASubject: "Скидки до 30% на все процедуры!",
    variantBSubject: "Весеннее обновление: выгодные цены",
    status: "completed",
    variantAMetrics: { sent: 24, opened: 16, clicked: 5 },
    variantBMetrics: { sent: 24, opened: 19, clicked: 7 },
    winner: "B",
    startedAt: "2026-03-10",
    createdAt: "2026-03-08",
  },
  {
    id: "abt-2",
    name: "Напоминание — тон сообщения",
    campaignName: "Напоминание о визите",
    variantASubject: "Ваш визит завтра в 10:00",
    variantBSubject: "Ждём вас завтра! Не забудьте про запись 🌸",
    status: "running",
    variantAMetrics: { sent: 6, opened: 5, clicked: 2 },
    variantBMetrics: { sent: 6, opened: 5, clicked: 1 },
    winner: null,
    startedAt: "2026-06-15",
    createdAt: "2026-06-14",
  },
  {
    id: "abt-3",
    name: "Новая процедура — CTA",
    campaignName: "Плазмолифтинг запуск",
    variantASubject: "Попробуйте плазмолифтинг — омоложение изнутри",
    variantBSubject: "Новая процедура: запишитесь со скидкой 15%",
    status: "draft",
    variantAMetrics: null,
    variantBMetrics: null,
    winner: null,
    startedAt: null,
    createdAt: "2026-06-18",
  },
];

export const conversionGoalsData: ConversionGoalItem[] = [
  {
    id: "cg-1",
    name: "Онлайн-запись",
    type: "booking",
    totalAttempts: 156,
    totalCompleted: 89,
    conversionRate: 57.1,
    trend: 5.2,
    createdAt: "2025-10-01",
  },
  {
    id: "cg-2",
    name: "Регистрация на сайте",
    type: "registration",
    totalAttempts: 420,
    totalCompleted: 186,
    conversionRate: 44.3,
    trend: -2.1,
    createdAt: "2025-10-01",
  },
  {
    id: "cg-3",
    name: "Реальный визит (после записи)",
    type: "visit",
    totalAttempts: 89,
    totalCompleted: 74,
    conversionRate: 83.1,
    trend: 3.8,
    createdAt: "2025-11-15",
  },
];

export const EMAIL_STATUS_LABELS: Record<EmailCampaignStatus, string> = {
  draft: "Черновик",
  scheduled: "Запланирована",
  sending: "Отправляется",
  sent: "Отправлена",
  failed: "Ошибка",
};

export const SMS_STATUS_LABELS: Record<SmsCampaignStatus, string> = {
  draft: "Черновик",
  scheduled: "Запланирована",
  sending: "Отправляется",
  sent: "Отправлена",
  failed: "Ошибка",
};

export const SMS_TYPE_LABELS: Record<string, string> = {
  notification: "Уведомление",
  reminder: "Напоминание",
  promotion: "Акция",
};

export const AB_TEST_STATUS_LABELS: Record<AbTestStatus, string> = {
  draft: "Черновик",
  running: "Запущен",
  completed: "Завершён",
  cancelled: "Отменён",
};

export const CONVERSION_TYPE_LABELS: Record<ConversionGoalType, string> = {
  booking: "Запись",
  registration: "Регистрация",
  visit: "Визит",
};

export const SUBSCRIBER_STATUS_LABELS: Record<SubscriberStatus, string> = {
  active: "Активен",
  unsubscribed: "Отписан",
  bounced: "Возврат",
};

export const promotionOverviewMetrics = [
  { label: "Email-рассылок", value: "5", change: 10, icon: "mail" },
  { label: "SMS отправлено", value: "101", change: 22, icon: "messageSquare" },
  { label: "UTM кликов", value: "1,358", change: 15, icon: "link" },
  { label: "Конверсия записей", value: "57.1%", change: 5.2, icon: "target" },
];

export const emailOpenRateData = [
  { label: "Янв", value: 58 },
  { label: "Фев", value: 62 },
  { label: "Мар", value: 71 },
  { label: "Апр", value: 66 },
  { label: "Май", value: 69 },
  { label: "Июн", value: 73 },
];

export const conversionFunnelData = [
  { stage: "Посетители", count: 1250, percentage: 100 },
  { stage: "Регистрации", count: 542, percentage: 43.4 },
  { stage: "Записи", count: 234, percentage: 18.7 },
  { stage: "Визиты", count: 196, percentage: 15.7 },
];
