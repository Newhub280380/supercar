export type Role = "admin" | "cosmetologist" | "client";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type EmailCampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed";

export type SkinType =
  | "normal"
  | "dry"
  | "oily"
  | "combination"
  | "sensitive";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  phone: string | null;
  settings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  cosmetologistId: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  cosmetologistId: string;
  serviceId: string;
  date: Date;
  endTime: Date | null;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientProfile {
  id: string;
  userId: string;
  cosmetologistId: string;
  notes: string | null;
  skinType: SkinType | null;
  allergies: string | null;
  preferences: Record<string, unknown> | null;
  dateOfBirth: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  topic: string | null;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaignMetrics {
  sent?: number;
  opened?: number;
  clicked?: number;
  bounced?: number;
}

export interface EmailCampaign {
  id: string;
  userId: string;
  subject: string;
  content: string;
  status: EmailCampaignStatus;
  sentAt: Date | null;
  scheduledAt: Date | null;
  metrics: EmailCampaignMetrics | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeoPage {
  id: string;
  pageUrl: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  ogImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
