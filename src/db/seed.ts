import { db } from "./index";
import {
  users,
  services,
  clients,
  appointments,
  aiConversations,
  emailCampaigns,
  seoPages,
} from "./schema";

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    console.log("📝 Creating users...");
    const adminUser = await db
      .insert(users)
      .values({
        email: "admin@cosmetology.com",
        passwordHash: "hashed_password_admin",
        name: "Администратор",
        role: "admin",
        phone: "+7 (999) 000-00-00",
        settings: { theme: "light", language: "ru" },
      })
      .returning();

    const cosmetologist1 = await db
      .insert(users)
      .values({
        email: "anna@cosmetology.com",
        passwordHash: "hashed_password_anna",
        name: "Анна Иванова",
        role: "cosmetologist",
        phone: "+7 (999) 111-11-11",
        avatar: "/avatars/anna.jpg",
        settings: { specialization: "Инъекционная косметология", experience: 8 },
      })
      .returning();

    const cosmetologist2 = await db
      .insert(users)
      .values({
        email: "maria@cosmetology.com",
        passwordHash: "hashed_password_maria",
        name: "Мария Петрова",
        role: "cosmetologist",
        phone: "+7 (999) 222-22-22",
        avatar: "/avatars/maria.jpg",
        settings: { specialization: "Аппаратная косметология", experience: 5 },
      })
      .returning();

    const client1 = await db
      .insert(users)
      .values({
        email: "elena@gmail.com",
        passwordHash: "hashed_password_elena",
        name: "Елена Смирнова",
        role: "client",
        phone: "+7 (999) 333-33-33",
      })
      .returning();

    const client2 = await db
      .insert(users)
      .values({
        email: "olga@gmail.com",
        passwordHash: "hashed_password_olga",
        name: "Ольга Козлова",
        role: "client",
        phone: "+7 (999) 444-44-44",
      })
      .returning();

    const client3 = await db
      .insert(users)
      .values({
        email: "natalia@gmail.com",
        passwordHash: "hashed_password_natalia",
        name: "Наталья Волкова",
        role: "client",
        phone: "+7 (999) 555-55-55",
      })
      .returning();

    console.log("✅ Users created");

    console.log("💆 Creating services...");
    const service1 = await db
      .insert(services)
      .values({
        cosmetologistId: cosmetologist1[0].id,
        name: "Биоревитализация",
        description:
          "Инъекционная процедура для глубокого увлажнения кожи с использованием гиалуроновой кислоты",
        price: "15000.00",
        duration: 60,
        category: "Инъекции",
        imageUrl: "/services/biorevitalization.jpg",
        isActive: "true",
      })
      .returning();

    const service2 = await db
      .insert(services)
      .values({
        cosmetologistId: cosmetologist1[0].id,
        name: "Ботулинотерапия",
        description:
          "Коррекция мимических морщин с помощью ботулотоксина. Эффект до 6 месяцев.",
        price: "25000.00",
        duration: 45,
        category: "Инъекции",
        imageUrl: "/services/botox.jpg",
        isActive: "true",
      })
      .returning();

    const service3 = await db
      .insert(services)
      .values({
        cosmetologistId: cosmetologist1[0].id,
        name: "Контурная пластика губ",
        description:
          "Увеличение и коррекция формы губ филлерами на основе гиалуроновой кислоты",
        price: "20000.00",
        duration: 60,
        category: "Инъекции",
        imageUrl: "/services/lip-filler.jpg",
        isActive: "true",
      })
      .returning();

    const service4 = await db
      .insert(services)
      .values({
        cosmetologistId: cosmetologist2[0].id,
        name: "RF-лифтинг",
        description:
          "Аппаратная процедура для подтяжки кожи и стимуляции выработки коллагена",
        price: "12000.00",
        duration: 90,
        category: "Аппаратная косметология",
        imageUrl: "/services/rf-lifting.jpg",
        isActive: "true",
      })
      .returning();

    const service5 = await db
      .insert(services)
      .values({
        cosmetologistId: cosmetologist2[0].id,
        name: "Лазерная шлифовка",
        description:
          "Фракционный лазер для улучшения текстуры кожи, удаления рубцов и пигментации",
        price: "30000.00",
        duration: 120,
        category: "Аппаратная косметология",
        imageUrl: "/services/laser-resurfacing.jpg",
        isActive: "true",
      })
      .returning();

    const service6 = await db
      .insert(services)
      .values({
        cosmetologistId: cosmetologist2[0].id,
        name: "Химический пилинг",
        description:
          "Профессиональный пилинг для обновления кожи, выравнивания тона и текстуры",
        price: "8000.00",
        duration: 45,
        category: "Пилинги",
        imageUrl: "/services/chemical-peel.jpg",
        isActive: "true",
      })
      .returning();

    console.log("✅ Services created");

    console.log("👥 Creating client profiles...");
    await db.insert(clients).values([
      {
        userId: client1[0].id,
        cosmetologistId: cosmetologist1[0].id,
        skinType: "dry",
        allergies: "Нет",
        notes: "Предпочитает натуральную косметику",
        preferences: { favoriteTreatments: ["Биоревитализация"] },
        dateOfBirth: new Date("1985-05-15"),
      },
      {
        userId: client2[0].id,
        cosmetologistId: cosmetologist1[0].id,
        skinType: "combination",
        allergies: "Пенициллин",
        notes: "Чувствительная кожа, склонная к покраснениям",
        preferences: { concerns: ["Купероз", "Сухость"] },
        dateOfBirth: new Date("1990-08-22"),
      },
      {
        userId: client3[0].id,
        cosmetologistId: cosmetologist2[0].id,
        skinType: "oily",
        allergies: "Нет",
        notes: "Интересуется аппаратными процедурами",
        preferences: { goals: ["Anti-age", "Выравнивание тона"] },
        dateOfBirth: new Date("1988-12-10"),
      },
    ]);
    console.log("✅ Client profiles created");

    console.log("📅 Creating appointments...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    await db.insert(appointments).values([
      {
        clientId: client1[0].id,
        cosmetologistId: cosmetologist1[0].id,
        serviceId: service1[0].id,
        date: tomorrow,
        endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
        status: "confirmed",
        notes: "Повторная процедура",
      },
      {
        clientId: client2[0].id,
        cosmetologistId: cosmetologist1[0].id,
        serviceId: service3[0].id,
        date: nextWeek,
        endTime: new Date(nextWeek.getTime() + 60 * 60 * 1000),
        status: "pending",
        notes: "Первичная консультация",
      },
      {
        clientId: client3[0].id,
        cosmetologistId: cosmetologist2[0].id,
        serviceId: service4[0].id,
        date: nextMonth,
        endTime: new Date(nextMonth.getTime() + 90 * 60 * 1000),
        status: "pending",
      },
    ]);
    console.log("✅ Appointments created");

    console.log("💬 Creating AI conversations...");
    await db.insert(aiConversations).values([
      {
        userId: client1[0].id,
        topic: "Уход за сухой кожей",
        messages: [
          {
            role: "user",
            content: "Как ухаживать за сухой кожей зимой?",
            timestamp: new Date().toISOString(),
          },
          {
            role: "assistant",
            content:
              "Для сухой кожи зимой важно использовать увлажняющие кремы с гиалуроновой кислотой, избегать горячей воды при умывании и применять питательные маски 1-2 раза в неделю.",
            timestamp: new Date().toISOString(),
          },
        ],
      },
      {
        userId: client2[0].id,
        topic: "Биоревитализация",
        messages: [
          {
            role: "user",
            content: "Сколько процедур биоревитализации нужно для эффекта?",
            timestamp: new Date().toISOString(),
          },
          {
            role: "assistant",
            content:
              "Обычно рекомендуется курс из 3-4 процедур с интервалом 2-3 недели. Результат сохраняется до 6 месяцев.",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ]);
    console.log("✅ AI conversations created");

    console.log("📧 Creating email campaigns...");
    await db.insert(emailCampaigns).values([
      {
        userId: cosmetologist1[0].id,
        subject: "Новогодние процедуры со скидкой 20%",
        content:
          "Дорогие клиенты! В честь наступающего Нового года дарим скидку 20% на все инъекционные процедуры до 31 декабря!",
        status: "sent",
        sentAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        metrics: { sent: 150, opened: 89, clicked: 34, bounced: 2 },
      },
      {
        userId: cosmetologist1[0].id,
        subject: "Напоминание о записи",
        content:
          "Напоминаем о вашей записи на процедуру биоревитализации завтра в 15:00.",
        status: "draft",
      },
    ]);
    console.log("✅ Email campaigns created");

    console.log("🔍 Creating SEO pages...");
    await db.insert(seoPages).values([
      {
        pageUrl: "/",
        metaTitle:
          "AI Cosmetology Platform - Умная платформа для косметологов",
        metaDescription:
          "Профессиональная платформа для косметологов с AI-консультантом, CRM и автоматизацией маркетинга",
        keywords:
          "косметология, AI, платформа, CRM, автоматизация, косметолог",
        ogImage: "/og/home.jpg",
      },
      {
        pageUrl: "/services",
        metaTitle: "Услуги косметолога - Биоревитализация, Ботокс, Пилинги",
        metaDescription:
          "Полный спектр косметологических услуг: инъекции, аппаратная косметология, пилинги. Запишитесь онлайн!",
        keywords:
          "биоревитализация, ботокс, пилинг, косметолог, услуги, цены",
        ogImage: "/og/services.jpg",
      },
      {
        pageUrl: "/about",
        metaTitle: "О нас - Команда профессиональных косметологов",
        metaDescription:
          "Наша команда - сертифицированные косметологи с многолетним опытом. Используем только проверенные методики и препараты.",
        keywords: "о нас, команда, косметологи, опыт, сертификаты",
        ogImage: "/og/about.jpg",
      },
    ]);
    console.log("✅ SEO pages created");

    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
