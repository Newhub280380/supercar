import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "cosmetologist", "client"]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  avatar: text("avatar"),
  role: roleEnum("role").notNull().default("client"),
  settings: jsonb("settings").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

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
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

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
  status: appointmentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  cosmetologistId: text("cosmetologist_id")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
  skinType: text("skin_type"),
  allergies: text("allergies"),
  preferences: jsonb("preferences").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  topic: text("topic"),
  messages: jsonb("messages")
    .$type<Array<{ role: string; content: string }>>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").default("draft"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  metrics: jsonb("metrics").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const seoPages = pgTable("seo_pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageUrl: text("page_url").notNull().unique(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
