import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
  pgEnum,
  uniqueIndex,
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
