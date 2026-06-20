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

export type SubscriberStatus = "active" | "unsubscribed" | "bounced";

export type SmsCampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed";

export type ConversionGoalType = "booking" | "registration" | "visit";

export type AbTestStatus = "draft" | "running" | "completed" | "cancelled";

export interface SubscriberList {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscriber {
  id: string;
  listId: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: SubscriberStatus;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}

export interface SmsCampaignMetrics {
  sent?: number;
  delivered?: number;
  failed?: number;
}

export interface SmsCampaign {
  id: string;
  userId: string;
  name: string;
  content: string;
  recipientCount: number;
  status: SmsCampaignStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  metrics: SmsCampaignMetrics | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UtmCampaign {
  id: string;
  userId: string;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  term: string | null;
  content: string | null;
  landingUrl: string;
  clickCount: number;
  conversionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionGoal {
  id: string;
  userId: string;
  name: string;
  type: ConversionGoalType;
  totalAttempts: number;
  totalCompleted: number;
  conversionRate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbTestMetrics {
  sent?: number;
  opened?: number;
  clicked?: number;
}

export interface AbTest {
  id: string;
  userId: string;
  campaignId: string | null;
  name: string;
  variantASubject: string;
  variantBSubject: string;
  variantAContent: string | null;
  variantBContent: string | null;
  status: AbTestStatus;
  variantAMetrics: AbTestMetrics | null;
  variantBMetrics: AbTestMetrics | null;
  winner: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentPlatform = &quot;instagram&quot; | &quot;telegram&quot; | &quot;vk&quot;;

export type ContentTone = "professional" | "friendly" | "entertaining";

export type ContentTemplateType =
  | "promotion"
  | "new_procedure"
  | "review"
  | "care_tips"
  | "seasonal"
  | "seo_description"
  | "email_welcome"
  | "email_reminder"
  | "email_promo"
  | "hashtags";

export type ContentType = "post" | "email" | "seo" | "hashtags";

export interface ContentGenerationRequest {
  platform: ContentPlatform;
  templateType: ContentTemplateType;
  topic: string;
  audience?: string;
  tone: ContentTone;
  length?: "short" | "medium" | "long";
  service?: string;
  hashtags?: boolean;
  seoKeywords?: string[];
}

export interface ContentGenerationResult {
  title?: string;
  content: string;
  hashtags?: string[];
  subjectLine?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  wordCount: number;
}

export interface ContentItem {
  id: string;
  platform: ContentPlatform;
  templateType: ContentTemplateType;
  contentType: ContentType;
  title: string | null;
  content: string;
  hashtags: string[] | null;
  subjectLine: string | null;
  metaDescription: string | null;
  tone: ContentTone;
  audience: string | null;
  topic: string;
  createdAt: string;
}

export interface ContentCalendarItem {
  id: string;
  title: string;
  platform: ContentPlatform;
  scheduledDate: string;
  scheduledTime: string;
  templateType: ContentTemplateType;
  status: "draft" | "scheduled" | "published";
  preview: string;
}
