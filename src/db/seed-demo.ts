/**
 * Демо-набор данных для 3D-дома: один владелец-косметолог, 50 клиентов,
 * прайс, записи за два месяца и маркетинговые кампании. Все строки помечены
 * префиксом `demo-`, поэтому скрипт можно запускать повторно — прошлый набор
 * удаляется, реальные данные не трогаются.
 *
 *   npm run db:seed:demo
 *   DEMO_EMAIL=me@example.com DEMO_PASSWORD='Passw0rd!23' npm run db:seed:demo
 */
import { eq, like } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { db } from "./index";
import {
  appointments,
  clients,
  emailCampaigns,
  services,
  smsCampaigns,
  subscriberLists,
  subscribers,
  users,
  utmCampaigns,
} from "./schema";

const PREFIX = "demo-";
const EMAIL = process.env.DEMO_EMAIL ?? "demo@beautyarts.org";
const PASSWORD = process.env.DEMO_PASSWORD ?? "Demo12345!";
const CLIENT_COUNT = 50;

const FIRST_NAMES = [
  "Айгерим", "Динара", "Асель", "Гульнара", "Мадина", "Алия", "Жанна",
  "Сауле", "Камила", "Нургуль", "Елена", "Ольга", "Ирина", "Наталья",
  "Светлана", "Анна", "Мария", "Татьяна", "Юлия", "Дарья",
];
const LAST_NAMES = [
  "Ахметова", "Сериккызы", "Нурланова", "Ибраева", "Касымова", "Смирнова",
  "Козлова", "Петрова", "Иванова", "Сидорова",
];

const PRICE_LIST = [
  { name: "Чистка лица механическая", price: 18000, duration: 90 },
  { name: "Ультразвуковая чистка", price: 14000, duration: 60 },
  { name: "Пилинг срединный", price: 32000, duration: 60 },
  { name: "Карбокситерапия", price: 22000, duration: 45 },
  { name: "Мезотерапия лица", price: 45000, duration: 60 },
  { name: "Биоревитализация", price: 75000, duration: 60 },
  { name: "Массаж лица", price: 12000, duration: 45 },
  { name: "Альгинатная маска", price: 9000, duration: 30 },
  { name: "Ботулинотерапия", price: 90000, duration: 45 },
  { name: "Контурная пластика губ", price: 120000, duration: 60 },
  { name: "Лазерная эпиляция (зона)", price: 15000, duration: 30 },
  { name: "Консультация косметолога", price: 5000, duration: 30 },
];

const STATUSES = ["completed", "completed", "completed", "confirmed",
  "pending", "cancelled"] as const;

/** Детерминированный псевдослучайный поток: набор одинаковый при каждом сиде. */
function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

async function removePreviousDemo(): Promise<void> {
  await db.delete(appointments).where(like(appointments.id, `${PREFIX}%`));
  await db.delete(clients).where(like(clients.id, `${PREFIX}%`));
  await db.delete(services).where(like(services.id, `${PREFIX}%`));
  await db.delete(subscribers).where(like(subscribers.id, `${PREFIX}%`));
  await db.delete(subscriberLists).where(like(subscriberLists.id, `${PREFIX}%`));
  await db.delete(emailCampaigns).where(like(emailCampaigns.id, `${PREFIX}%`));
  await db.delete(smsCampaigns).where(like(smsCampaigns.id, `${PREFIX}%`));
  await db.delete(utmCampaigns).where(like(utmCampaigns.id, `${PREFIX}%`));
  await db.delete(users).where(like(users.id, `${PREFIX}%`));
}

async function seedDemo(): Promise<void> {
  await removePreviousDemo();

  const random = rng(20260815);
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const passwordHash = await hashPassword(PASSWORD);

  const existingOwner = await db.query.users.findFirst({
    where: eq(users.email, EMAIL),
  });
  const ownerId = existingOwner?.id ?? `${PREFIX}owner`;
  if (existingOwner) {
    await db
      .update(users)
      .set({ role: "cosmetologist", updatedAt: new Date() })
      .where(eq(users.id, ownerId));
  } else {
    await db.insert(users).values({
      id: ownerId,
      email: EMAIL,
      passwordHash,
      name: "Демо-салон BeautyArts",
      role: "cosmetologist",
      phone: "+7 777 688 78 88",
    });
  }

  await db.insert(services).values(
    PRICE_LIST.map((item, index) => ({
      id: `${PREFIX}svc-${index}`,
      cosmetologistId: ownerId,
      name: item.name,
      price: item.price.toFixed(2),
      duration: item.duration,
      category: "Косметология",
      isActive: index === PRICE_LIST.length - 1 ? "false" : "true",
    })),
  );

  const clientIds: string[] = [];
  for (let index = 0; index < CLIENT_COUNT; index += 1) {
    const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${
      LAST_NAMES[index % LAST_NAMES.length]
    }`;
    const userId = `${PREFIX}client-${index}`;
    // Половина клиентов пришла в этом месяце — так видно прирост базы.
    const createdAt =
      index % 2 === 0
        ? new Date(monthStart.getTime() + index * 3600_000)
        : new Date(monthStart.getTime() - (index + 1) * 86_400_000);
    await db.insert(users).values({
      id: userId,
      email: `demo.client${index}@beautyarts.org`,
      passwordHash,
      name,
      role: "client",
      phone: `+7 70${index % 10} ${100 + index} ${20 + index} ${30 + index}`,
      createdAt,
      updatedAt: createdAt,
    });
    await db.insert(clients).values({
      id: `${PREFIX}crm-${index}`,
      userId,
      cosmetologistId: ownerId,
      skinType: index % 3 === 0 ? "dry" : index % 3 === 1 ? "oily" : "normal",
      notes: "Демо-клиент, заменится реальными данными",
      createdAt,
      updatedAt: createdAt,
    });
    clientIds.push(userId);
  }

  const rows = [];
  for (let index = 0; index < 140; index += 1) {
    const service = PRICE_LIST[Math.floor(random() * PRICE_LIST.length)];
    const serviceIndex = PRICE_LIST.indexOf(service);
    // Даты раскиданы от прошлого месяца до +2 недель вперёд.
    const offsetDays = Math.floor(random() * 60) - 45;
    const date = new Date(now.getTime() + offsetDays * 86_400_000);
    const status =
      date > now ? "confirmed" : STATUSES[Math.floor(random() * STATUSES.length)];
    rows.push({
      id: `${PREFIX}ap-${index}`,
      clientId: clientIds[Math.floor(random() * clientIds.length)],
      cosmetologistId: ownerId,
      serviceId: `${PREFIX}svc-${serviceIndex}`,
      date,
      status,
      notes: null,
    });
  }
  await db.insert(appointments).values(rows);

  await db.insert(emailCampaigns).values(
    ["Летние скидки на чистку", "Новинка: биоревитализация", "Приведи подругу"]
      .map((subject, index) => ({
        id: `${PREFIX}email-${index}`,
        userId: ownerId,
        subject,
        content: "Демо-рассылка",
        status: "sent" as const,
        sentAt: new Date(now.getTime() - (index + 1) * 86_400_000),
        metrics: { sent: 420 + index * 30, opened: 180 + index * 20, clicked: 44 },
      })),
  );
  await db.insert(smsCampaigns).values(
    ["Напоминание о записи", "Акция выходного дня"].map((name, index) => ({
      id: `${PREFIX}sms-${index}`,
      userId: ownerId,
      name,
      content: "Демо-SMS",
      recipientCount: 250 + index * 40,
      status: "sent" as const,
      sentAt: new Date(now.getTime() - (index + 2) * 86_400_000),
    })),
  );
  await db.insert(utmCampaigns).values(
    [
      { source: "instagram", campaign: "stories_august" },
      { source: "facebook", campaign: "lookalike_almaty" },
      { source: "google", campaign: "search_cleaning" },
      { source: "tiktok", campaign: "reels_peeling" },
    ].map((utm, index) => ({
      id: `${PREFIX}utm-${index}`,
      userId: ownerId,
      name: utm.campaign,
      source: utm.source,
      medium: "cpc",
      campaign: utm.campaign,
      landingUrl: "https://beautyarts-crm.vercel.app/",
      clickCount: 800 + index * 220,
      conversionCount: 30 + index * 9,
    })),
  );

  const listId = `${PREFIX}list-0`;
  await db.insert(subscriberLists).values({
    id: listId,
    userId: ownerId,
    name: "Основная база",
    subscriberCount: CLIENT_COUNT,
  });
  await db.insert(subscribers).values(
    Array.from({ length: CLIENT_COUNT }, (_unused, index) => ({
      id: `${PREFIX}sub-${index}`,
      listId,
      email: `demo.client${index}@beautyarts.org`,
      name: `${FIRST_NAMES[index % FIRST_NAMES.length]}`,
    })),
  );

  console.log(`Демо-данные готовы. Вход: ${EMAIL} / ${PASSWORD}`);
}

seedDemo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Не удалось засеять демо-данные:", error);
    process.exit(1);
  });
