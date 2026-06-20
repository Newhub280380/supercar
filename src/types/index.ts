export type Role = "admin" | "cosmetologist" | "client";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  createdAt: Date;
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
}

export interface Appointment {
  id: string;
  clientId: string;
  cosmetologistId: string;
  serviceId: string;
  date: Date;
  status: AppointmentStatus;
}

export interface ClientProfile {
  id: string;
  userId: string;
  cosmetologistId: string;
  notes: string | null;
  skinType: string | null;
  allergies: string | null;
}

export interface AIConversation {
  id: string;
  userId: string;
  topic: string | null;
  messages: Array<{ role: string; content: string }>;
  createdAt: Date;
}

export interface EmailCampaign {
  id: string;
  userId: string;
  subject: string;
  content: string;
  status: string | null;
  sentAt: Date | null;
}
