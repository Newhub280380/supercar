import type { AppointmentStatus, SkinType } from "@/types";

export interface DashboardMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface AppointmentItem {
  id: string;
  clientName: string;
  clientAvatar: string | null;
  service: string;
  servicePrice: string;
  date: string;
  time: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  skinType: SkinType | null;
}

export interface ClientItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  skinType: SkinType | null;
  allergies: string | null;
  notes: string | null;
  totalVisits: number;
  totalSpent: string;
  lastVisit: string;
  createdAt: string;
  status: "new" | "returning" | "vip";
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  appointmentsCount: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ReminderItem {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  type: "upcoming" | "followup" | "birthday";
}

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Записей сегодня", value: "8", change: 12, icon: "calendar" },
  { label: "Новых клиентов", value: "3", change: 25, icon: "userPlus" },
  { label: "Доход за месяц", value: "₽248,500", change: 8.5, icon: "trendingUp" },
  { label: "Средний рейтинг", value: "4.9", change: 0.2, icon: "star" },
];

export const weeklyChartData: ChartDataPoint[] = [
  { label: "Пн", value: 5 },
  { label: "Вт", value: 8 },
  { label: "Ср", value: 6 },
  { label: "Чт", value: 9 },
  { label: "Пт", value: 7 },
  { label: "Сб", value: 10 },
  { label: "Вс", value: 2 },
];

export const revenueChartData: ChartDataPoint[] = [
  { label: "Янв", value: 185000 },
  { label: "Фев", value: 210000 },
  { label: "Мар", value: 195000 },
  { label: "Апр", value: 230000 },
  { label: "Май", value: 248500 },
  { label: "Июн", value: 265000 },
];

export const appointmentsData: AppointmentItem[] = [
  {
    id: "apt-1",
    clientName: "Анна Петрова",
    clientAvatar: null,
    service: "Биоревитализация",
    servicePrice: "12,000",
    date: fmt(today),
    time: "09:00",
    endTime: "10:00",
    status: "confirmed",
    notes: "Первый визит, консультация",
    skinType: "dry",
  },
  {
    id: "apt-2",
    clientName: "Мария Иванова",
    clientAvatar: null,
    service: "Химический пилинг",
    servicePrice: "8,500",
    date: fmt(today),
    time: "10:30",
    endTime: "11:30",
    status: "pending",
    notes: null,
    skinType: "oily",
  },
  {
    id: "apt-3",
    clientName: "Елена Смирнова",
    clientAvatar: null,
    service: "Контурная пластика",
    servicePrice: "25,000",
    date: fmt(today),
    time: "12:00",
    endTime: "13:30",
    status: "confirmed",
    notes: "Филлер губ",
    skinType: "normal",
  },
  {
    id: "apt-4",
    clientName: "Ольга Козлова",
    clientAvatar: null,
    service: "Мезотерапия",
    servicePrice: "15,000",
    date: fmt(today),
    time: "14:00",
    endTime: "15:00",
    status: "completed",
    notes: null,
    skinType: "combination",
  },
  {
    id: "apt-5",
    clientName: "Татьяна Соколова",
    clientAvatar: null,
    service: "Чистка лица",
    servicePrice: "5,000",
    date: fmt(today),
    time: "15:30",
    endTime: "16:15",
    status: "completed",
    notes: "Глубокая чистка",
    skinType: "sensitive",
  },
  {
    id: "apt-6",
    clientName: "Наталья Волкова",
    clientAvatar: null,
    service: "Ботокс",
    servicePrice: "18,000",
    date: fmt(addDays(today, 1)),
    time: "10:00",
    endTime: "10:45",
    status: "confirmed",
    notes: "Лоб, межбровье",
    skinType: "normal",
  },
  {
    id: "apt-7",
    clientName: "Ирина Новикова",
    clientAvatar: null,
    service: "Плазмолифтинг",
    servicePrice: "20,000",
    date: fmt(addDays(today, 1)),
    time: "11:30",
    endTime: "12:30",
    status: "pending",
    notes: null,
    skinType: "dry",
  },
  {
    id: "apt-8",
    clientName: "Дарья Морозова",
    clientAvatar: null,
    service: "Уход за кожей лица",
    servicePrice: "7,000",
    date: fmt(addDays(today, 2)),
    time: "09:30",
    endTime: "10:30",
    status: "pending",
    notes: null,
    skinType: "combination",
  },
  {
    id: "apt-9",
    clientName: "Анна Петрова",
    clientAvatar: null,
    service: "Повторная консультация",
    servicePrice: "3,000",
    date: fmt(addDays(today, 2)),
    time: "14:00",
    endTime: "14:30",
    status: "pending",
    notes: "Контроль после биоревитализации",
    skinType: "dry",
  },
  {
    id: "apt-10",
    clientName: "Светлана Кузнецова",
    clientAvatar: null,
    service: "Лазерная эпиляция",
    servicePrice: "6,500",
    date: fmt(addDays(today, -1)),
    time: "11:00",
    endTime: "11:45",
    status: "cancelled",
    notes: null,
    skinType: "normal",
  },
];

export const clientsData: ClientItem[] = [
  {
    id: "cl-1",
    name: "Анна Петрова",
    email: "anna.petrova@mail.ru",
    phone: "+7 (903) 123-45-67",
    avatar: null,
    skinType: "dry",
    allergies: "Нет",
    notes: "Предпочитает утренние записи. Кожа склонна к сухости.",
    totalVisits: 12,
    totalSpent: "156,000",
    lastVisit: fmt(addDays(today, -5)),
    createdAt: fmt(addDays(today, -180)),
    status: "vip",
  },
  {
    id: "cl-2",
    name: "Мария Иванова",
    email: "maria.ivanova@gmail.com",
    phone: "+7 (915) 234-56-78",
    avatar: null,
    skinType: "oily",
    allergies: "Парабены",
    notes: "Интересуется anti-age процедурами",
    totalVisits: 5,
    totalSpent: "52,500",
    lastVisit: fmt(addDays(today, -12)),
    createdAt: fmt(addDays(today, -90)),
    status: "returning",
  },
  {
    id: "cl-3",
    name: "Елена Смирнова",
    email: "elena.smirnova@yandex.ru",
    phone: "+7 (926) 345-67-89",
    avatar: null,
    skinType: "normal",
    allergies: "Нет",
    notes: "VIP клиент. Предпочитает премиум процедуры.",
    totalVisits: 24,
    totalSpent: "425,000",
    lastVisit: fmt(addDays(today, -2)),
    createdAt: fmt(addDays(today, -365)),
    status: "vip",
  },
  {
    id: "cl-4",
    name: "Ольга Козлова",
    email: "olga.kozlova@mail.ru",
    phone: "+7 (905) 456-78-90",
    avatar: null,
    skinType: "combination",
    allergies: "Латекс",
    notes: null,
    totalVisits: 8,
    totalSpent: "89,000",
    lastVisit: fmt(today),
    createdAt: fmt(addDays(today, -120)),
    status: "returning",
  },
  {
    id: "cl-5",
    name: "Татьяна Соколова",
    email: "tatiana.sokolova@inbox.ru",
    phone: "+7 (916) 567-89-01",
    avatar: null,
    skinType: "sensitive",
    allergies: "Орехи, мёд",
    notes: "Очень чувствительная кожа, только мягкие процедуры",
    totalVisits: 15,
    totalSpent: "112,000",
    lastVisit: fmt(today),
    createdAt: fmt(addDays(today, -240)),
    status: "vip",
  },
  {
    id: "cl-6",
    name: "Наталья Волкова",
    email: "natalia.volkova@gmail.com",
    phone: "+7 (903) 678-90-12",
    avatar: null,
    skinType: "normal",
    allergies: "Нет",
    notes: null,
    totalVisits: 3,
    totalSpent: "38,000",
    lastVisit: fmt(addDays(today, -20)),
    createdAt: fmt(addDays(today, -60)),
    status: "returning",
  },
  {
    id: "cl-7",
    name: "Ирина Новикова",
    email: "irina.novikova@yandex.ru",
    phone: "+7 (925) 789-01-23",
    avatar: null,
    skinType: "dry",
    allergies: "Никель",
    notes: "Интересуется плазмолифтингом",
    totalVisits: 6,
    totalSpent: "74,000",
    lastVisit: fmt(addDays(today, -8)),
    createdAt: fmt(addDays(today, -150)),
    status: "returning",
  },
  {
    id: "cl-8",
    name: "Дарья Морозова",
    email: "daria.morozova@mail.ru",
    phone: "+7 (917) 890-12-34",
    avatar: null,
    skinType: "combination",
    allergies: "Нет",
    notes: null,
    totalVisits: 2,
    totalSpent: "14,000",
    lastVisit: fmt(addDays(today, -30)),
    createdAt: fmt(addDays(today, -45)),
    status: "new",
  },
  {
    id: "cl-9",
    name: "Светлана Кузнецова",
    email: "svetlana.k@mail.ru",
    phone: "+7 (909) 901-23-45",
    avatar: null,
    skinType: "normal",
    allergies: "Пыльца",
    notes: null,
    totalVisits: 1,
    totalSpent: "6,500",
    lastVisit: fmt(addDays(today, -1)),
    createdAt: fmt(addDays(today, -10)),
    status: "new",
  },
  {
    id: "cl-10",
    name: "Людмила Белова",
    email: "ludmila.belova@gmail.com",
    phone: "+7 (912) 012-34-56",
    avatar: null,
    skinType: "sensitive",
    allergies: "Нет",
    notes: "Рекомендация от А. Петровой",
    totalVisits: 1,
    totalSpent: "5,000",
    lastVisit: fmt(addDays(today, -3)),
    createdAt: fmt(addDays(today, -3)),
    status: "new",
  },
];

export const servicesData: ServiceItem[] = [
  {
    id: "srv-1",
    name: "Биоревитализация",
    description: "Инъекционная процедура для глубокого увлажнения кожи гиалуроновой кислотой",
    price: "12,000",
    duration: 60,
    category: "Инъекции",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 34,
  },
  {
    id: "srv-2",
    name: "Химический пилинг",
    description: "Профессиональный пилинг фруктовыми кислотами для обновления кожи",
    price: "8,500",
    duration: 60,
    category: "Пилинги",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 28,
  },
  {
    id: "srv-3",
    name: "Контурная пластика",
    description: "Коррекция лица филлерами на основе гиалуроновой кислоты",
    price: "25,000",
    duration: 90,
    category: "Филлеры",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 18,
  },
  {
    id: "srv-4",
    name: "Мезотерапия",
    description: "Инъекционный коктейль витаминов для кожи лица",
    price: "15,000",
    duration: 60,
    category: "Инъекции",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 22,
  },
  {
    id: "srv-5",
    name: "Чистка лица",
    description: "Комбинированная чистка лица: механическая + ультразвуковая",
    price: "5,000",
    duration: 45,
    category: "Уход",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 45,
  },
  {
    id: "srv-6",
    name: "Ботокс",
    description: "Инъекции ботулотоксина для разглаживания мимических морщин",
    price: "18,000",
    duration: 45,
    category: "Инъекции",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 31,
  },
  {
    id: "srv-7",
    name: "Плазмолифтинг",
    description: "Омоложение кожи собственным тромбоцитарным плазменным гелем",
    price: "20,000",
    duration: 60,
    category: "Инъекции",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 12,
  },
  {
    id: "srv-8",
    name: "Уход за кожей лица",
    description: "Профессиональная чистка и уход с использованием космецевтики",
    price: "7,000",
    duration: 60,
    category: "Уход",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 52,
  },
  {
    id: "srv-9",
    name: "Лазерная эпиляция",
    description: "Удаление нежелательных волос лазерным методом",
    price: "6,500",
    duration: 45,
    category: "Лазер",
    imageUrl: null,
    isActive: false,
    appointmentsCount: 15,
  },
  {
    id: "srv-10",
    name: "Повторная консультация",
    description: "Контрольный осмотр и рекомендации после процедуры",
    price: "3,000",
    duration: 30,
    category: "Консультация",
    imageUrl: null,
    isActive: true,
    appointmentsCount: 68,
  },
];

export const remindersData: ReminderItem[] = [
  {
    id: "rem-1",
    clientName: "Наталья Волкова",
    service: "Ботокс",
    date: fmt(addDays(today, 1)),
    time: "10:00",
    type: "upcoming",
  },
  {
    id: "rem-2",
    clientName: "Ирина Новикова",
    service: "Плазмолифтинг",
    date: fmt(addDays(today, 1)),
    time: "11:30",
    type: "upcoming",
  },
  {
    id: "rem-3",
    clientName: "Елена Смирнова",
    service: "Контроль после процедуры",
    date: fmt(addDays(today, 3)),
    time: "12:00",
    type: "followup",
  },
  {
    id: "rem-4",
    clientName: "Анна Петрова",
    service: "День рождения",
    date: fmt(addDays(today, 7)),
    time: "",
    type: "birthday",
  },
];

export const SERVICE_CATEGORIES = [
  "Инъекции",
  "Пилинги",
  "Филлеры",
  "Уход",
  "Лазер",
  "Консультация",
];

export const SKIN_TYPE_LABELS: Record<string, string> = {
  normal: "Нормальная",
  dry: "Сухая",
  oily: "Жирная",
  combination: "Комбинированная",
  sensitive: "Чувствительная",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
};

export function getClientAppointments(clientId: string): AppointmentItem[] {
  const client = clientsData.find((c) => c.id === clientId);
  if (!client) return [];
  return appointmentsData.filter((a) => a.clientName === client.name);
}
