import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
  pgEnum,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["admin", "cosmetologist", "client"]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const emailCampaignStatusEnum = pgEnum("email_campaign_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
]);

export const skinTypeEnum = pgEnum("skin_type", [
  "normal",
  "dry",
  "oily",
  "combination",
  "sensitive",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  avatar: text("avatar"),
  role: roleEnum("role").notNull().default("client"),
  phone: text("phone"),
  settings: jsonb("settings").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  clients: many(clients),
  aiConversations: many(aiConversations),
  emailCampaigns: many(emailCampaigns),
  cosmetologistServices: many(services),
  cosmetologistAppointments: many(appointments),
  clientAppointments: many(appointments),
  cosmetologistProfile: one(users, {
    fields: [users.id],
    references: [users.id],
  }),
}));

export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cosmetologistId: text("cosmetologist_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  category: text("category"),
  imageUrl: text("image_url"),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  cosmetologist: one(users, {
    fields: [services.cosmetologistId],
    references: [users.id],
    relationName: "cosmetologistServices",
  }),
  appointments: many(appointments),
}));

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id")
    .notNull()
    .references(() => users.id),
  cosmetologistId: text("cosmetologist_id")
    .notNull()
    .references(() => users.id),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  date: timestamp("date", { mode: "date" }).notNull(),
  endTime: timestamp("end_time", { mode: "date" }),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
    relationName: "clientAppointments",
  }),
  cosmetologist: one(users, {
    fields: [appointments.cosmetologistId],
    references: [users.id],
    relationName: "cosmetologistAppointments",
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));

export const clients = pgTable(
  "clients",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    cosmetologistId: text("cosmetologist_id")
      .notNull()
      .references(() => users.id),
    notes: text("notes"),
    skinType: skinTypeEnum("skin_type"),
    allergies: text("allergies"),
    preferences: jsonb("preferences").$type<Record<string, unknown>>(),
    dateOfBirth: timestamp("date_of_birth", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("clients_user_cosmetologist_idx").on(
      table.userId,
      table.cosmetologistId,
    ),
  ],
);

export const clientsRelations = relations(clients, ({ one }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
    relationName: "clientUser",
  }),
  cosmetologist: one(users, {
    fields: [clients.cosmetologistId],
    references: [users.id],
    relationName: "clientCosmetologist",
  }),
}));

export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  topic: text("topic"),
  messages: jsonb("messages")
    .$type<Array<{ role: string; content: string; timestamp?: string }>>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const aiConversationsRelations = relations(
  aiConversations,
  ({ one }) => ({
    user: one(users, {
      fields: [aiConversations.userId],
      references: [users.id],
    }),
  }),
);

export const emailCampaigns = pgTable("email_campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: emailCampaignStatusEnum("status").notNull().default("draft"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  scheduledAt: timestamp("scheduled_at", { mode: "date" }),
  metrics: jsonb("metrics").$type<{
    sent?: number;
    opened?: number;
    clicked?: number;
    bounced?: number;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const emailCampaignsRelations = relations(
  emailCampaigns,
  ({ one }) => ({
    user: one(users, {
      fields: [emailCampaigns.userId],
      references: [users.id],
    }),
  }),
);

export const seoPages = pgTable("seo_pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageUrl: text("page_url").notNull().unique(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords"),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const cosmetologistProfiles = pgTable(
  "cosmetologist_profiles",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    specializations: jsonb("specializations")
      .$type<string[]>()
      .notNull()
      .default([]),
    experienceYears: integer("experience_years"),
    bio: text("bio"),
    workingHours: jsonb("working_hours").$type<Record<string, { start: string; end: string }>>(),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cosmetologist_profiles_user_idx").on(table.userId),
  ],
);

export const cosmetologistProfilesRelations = relations(
  cosmetologistProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [cosmetologistProfiles.userId],
      references: [users.id],
    }),
  }),
);

export const clientPersonalInfos = pgTable("client_personal_infos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  skinType: skinTypeEnum("skin_type"),
  allergies: text("allergies"),
  preferences: jsonb("preferences").$type<Record<string, unknown>>(),
  medicalConditions: text("medical_conditions"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("client_personal_infos_user_idx").on(table.userId),
]);

export const clientPersonalInfosRelations = relations(
  clientPersonalInfos,
  ({ one }) => ({
    user: one(users, {
      fields: [clientPersonalInfos.userId],
      references: [users.id],
    }),
  }),
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  }),
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  jwtId: text("jwt_id").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const subscriberStatusEnum = pgEnum("subscriber_status", [
  "active",
  "unsubscribed",
  "bounced",
]);

export const smsCampaignStatusEnum = pgEnum("sms_campaign_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
]);

export const conversionGoalTypeEnum = pgEnum("conversion_goal_type", [
  "booking",
  "registration",
  "visit",
]);

export const abTestStatusEnum = pgEnum("ab_test_status", [
  "draft",
  "running",
  "completed",
  "cancelled",
]);

export const subscriberLists = pgTable(
  "subscriber_lists",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    subscriberCount: integer("subscriber_count").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
);

export const subscriberListsRelations = relations(subscriberLists, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriberLists.userId],
    references: [users.id],
  }),
  subscribers: many(subscribers),
}));

export const subscribers = pgTable(
  "subscribers",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    listId: text("list_id")
      .notNull()
      .references(() => subscriberLists.id),
    email: text("email").notNull(),
    name: text("name"),
    phone: text("phone"),
    status: subscriberStatusEnum("status").notNull().default("active"),
    subscribedAt: timestamp("subscribed_at", { mode: "date" }).defaultNow().notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { mode: "date" }),
  },
  (table) => [
    uniqueIndex("subscribers_list_email_idx").on(table.listId, table.email),
  ],
);

export const subscribersRelations = relations(subscribers, ({ one }) => ({
  list: one(subscriberLists, {
    fields: [subscribers.listId],
    references: [subscriberLists.id],
  }),
}));

export const smsCampaigns = pgTable("sms_campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  content: text("content").notNull(),
  recipientCount: integer("recipient_count").notNull().default(0),
  status: smsCampaignStatusEnum("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at", { mode: "date" }),
  sentAt: timestamp("sent_at", { mode: "date" }),
  metrics: jsonb("metrics").$type<{
    sent?: number;
    delivered?: number;
    failed?: number;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const smsCampaignsRelations = relations(smsCampaigns, ({ one }) => ({
  user: one(users, {
    fields: [smsCampaigns.userId],
    references: [users.id],
  }),
}));

export const utmCampaigns = pgTable("utm_campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  source: text("source").notNull(),
  medium: text("medium").notNull(),
  campaign: text("campaign").notNull(),
  term: text("term"),
  content: text("content"),
  landingUrl: text("landing_url").notNull(),
  clickCount: integer("click_count").notNull().default(0),
  conversionCount: integer("conversion_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const utmCampaignsRelations = relations(utmCampaigns, ({ one }) => ({
  user: one(users, {
    fields: [utmCampaigns.userId],
    references: [users.id],
  }),
}));

export const conversionGoals = pgTable("conversion_goals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  type: conversionGoalTypeEnum("type").notNull(),
  totalAttempts: integer("total_attempts").notNull().default(0),
  totalCompleted: integer("total_completed").notNull().default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const conversionGoalsRelations = relations(conversionGoals, ({ one }) => ({
  user: one(users, {
    fields: [conversionGoals.userId],
    references: [users.id],
  }),
}));

export const abTests = pgTable("ab_tests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  campaignId: text("campaign_id")
    .references(() => emailCampaigns.id),
  name: text("name").notNull(),
  variantASubject: text("variant_a_subject").notNull(),
  variantBSubject: text("variant_b_subject").notNull(),
  variantAContent: text("variant_a_content"),
  variantBContent: text("variant_b_content"),
  status: abTestStatusEnum("status").notNull().default("draft"),
  variantAMetrics: jsonb("variant_a_metrics").$type<{
    sent?: number;
    opened?: number;
    clicked?: number;
  }>(),
  variantBMetrics: jsonb("variant_b_metrics").$type<{
    sent?: number;
    opened?: number;
    clicked?: number;
  }>(),
  winner: text("winner"),
  startedAt: timestamp("started_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const abTestsRelations = relations(abTests, ({ one }) => ({
  user: one(users, {
    fields: [abTests.userId],
    references: [users.id],
  }),
  campaign: one(emailCampaigns, {
    fields: [abTests.campaignId],
    references: [emailCampaigns.id],
  }),
}));

