export interface RevenueDataPoint {
  month: string;
  revenue: number;
  appointments: number;
  newClients: number;
}

export interface ServicePopularity {
  name: string;
  count: number;
  revenue: number;
  category: string;
}

export interface ClientSegment {
  segment: string;
  count: number;
  revenue: number;
  avgVisits: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}

export interface AIInsight {
  id: string;
  type: "positive" | "warning" | "suggestion" | "trend";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionLabel: string;
}

export interface ForecastDataPoint {
  month: string;
  actual: number | null;
  forecast: number | null;
  lowerBound: number | null;
  upperBound: number | null;
}

export interface BusinessHealth {
  score: number;
  revenueTrend: "up" | "down" | "stable";
  clientRetention: number;
  utilization: number;
  avgCheck: number;
  newClientsGrowth: number;
}

export interface MetricSummary {
  ltv: number;
  avgCheck: number;
  conversionRate: number;
  retentionRate: number;
  revenueGrowth: number;
  clientGrowth: number;
}

export type DateRange = "month" | "quarter" | "year";

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

export const monthlyRevenueData: RevenueDataPoint[] = [
  { month: "Янв", revenue: 185000, appointments: 52, newClients: 8 },
  { month: "Фев", revenue: 210000, appointments: 58, newClients: 12 },
  { month: "Мар", revenue: 195000, appointments: 54, newClients: 9 },
  { month: "Апр", revenue: 230000, appointments: 63, newClients: 14 },
  { month: "Май", revenue: 248500, appointments: 68, newClients: 15 },
  { month: "Июн", revenue: 265000, appointments: 72, newClients: 18 },
  { month: "Июл", revenue: 258000, appointments: 70, newClients: 16 },
  { month: "Авг", revenue: 275000, appointments: 75, newClients: 20 },
  { month: "Сен", revenue: 290000, appointments: 79, newClients: 22 },
  { month: "Окт", revenue: 310000, appointments: 84, newClients: 24 },
  { month: "Ноя", revenue: 298000, appointments: 80, newClients: 19 },
  { month: "Дек", revenue: 335000, appointments: 90, newClients: 26 },
];

export const quarterlyData: RevenueDataPoint[] = [
  { month: "Q1 2024", revenue: 590000, appointments: 164, newClients: 29 },
  { month: "Q2 2024", revenue: 743500, appointments: 203, newClients: 47 },
  { month: "Q3 2024", revenue: 823000, appointments: 224, newClients: 58 },
  { month: "Q4 2024", revenue: 943000, appointments: 254, newClients: 69 },
];

export const yearlyData: RevenueDataPoint[] = [
  { month: "2021", revenue: 1850000, appointments: 520, newClients: 85 },
  { month: "2022", revenue: 2340000, appointments: 650, newClients: 120 },
  { month: "2023", revenue: 2750000, appointments: 750, newClients: 165 },
  { month: "2024", revenue: 3100000, appointments: 845, newClients: 203 },
];

export const servicePopularityData: ServicePopularity[] = [
  { name: "Чистка лица", count: 45, revenue: 225000, category: "Уход" },
  { name: "Биоревитализация", count: 34, revenue: 408000, category: "Инъекции" },
  { name: "Ботокс", count: 31, revenue: 558000, category: "Инъекции" },
  { name: "Химический пилинг", count: 28, revenue: 238000, category: "Пилинги" },
  { name: "Мезотерапия", count: 22, revenue: 330000, category: "Инъекции" },
  { name: "Контурная пластика", count: 18, revenue: 450000, category: "Филлеры" },
  { name: "Лазерная эпиляция", count: 15, revenue: 97500, category: "Лазер" },
  { name: "Плазмолифтинг", count: 12, revenue: 240000, category: "Инъекции" },
];

export const clientSegments: ClientSegment[] = [
  { segment: "VIP", count: 5, revenue: 890000, avgVisits: 18.4 },
  { segment: "Постоянные", count: 12, revenue: 650000, avgVisits: 7.2 },
  { segment: "Новые", count: 28, revenue: 340000, avgVisits: 1.8 },
  { segment: "Возвращающиеся", count: 15, revenue: 280000, avgVisits: 3.5 },
];

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 9);

export function generateHeatmapData(): HeatmapCell[] {
  const data: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (const hour of HOURS) {
      let base = 3;
      if (day >= 1 && day <= 3) base = 6;
      if (day === 5) base = 8;
      if (day === 6) base = 2;
      if (hour >= 11 && hour <= 14) base += 3;
      if (hour >= 16 && hour <= 19) base += 2;
      const noise = Math.floor(Math.random() * 3) - 1;
      data.push({ day, hour, value: Math.max(0, Math.min(10, base + noise)) });
    }
  }
  return data;
}

export const heatmapDays = DAYS;
export const heatmapHours = HOURS;

export const aiInsights: AIInsight[] = [
  {
    id: "ins-1",
    type: "positive",
    title: "Рост популярности инъекций",
    description: "Биоревитализация и ботокс показали рост на 35% за последний квартал. Рекомендуется увеличить рекламу этих процедур.",
    impact: "high",
    actionLabel: "Увеличить рекламу",
  },
  {
    id: "ins-2",
    type: "warning",
    title: "Снижение загрузки в среду",
    description: "Загрузка по средам на 40% ниже среднего. Предложите скидки или акции для этого дня.",
    impact: "medium",
    actionLabel: "Создать акцию",
  },
  {
    id: "ins-3",
    type: "suggestion",
    title: "Потенциал контурной пластики",
    description: "Средний чек контурной пластики в 2.5 раза выше среднего. Рекомендуйте процедуру постоянным клиентам.",
    impact: "high",
    actionLabel: "Смотреть клиентов",
  },
  {
    id: "ins-4",
    type: "trend",
    title: "Сезонный тренд: пилинги",
    description: "Осенью спрос на пилинги вырастает на 60%. Подготовьте рекламную кампанию заранее.",
    impact: "high",
    actionLabel: "Планировать кампанию",
  },
  {
    id: "ins-5",
    type: "suggestion",
    title: "VIP-клиенты реже записываются",
    description: "3 VIP-клиента не были более 45 дней. Рекомендация: отправить персональное предложение.",
    impact: "medium",
    actionLabel: "Отправить предложения",
  },
  {
    id: "ins-6",
    type: "positive",
    title: "Высокая конверсия новых клиентов",
    description: "Конверсия новых клиентов в повторные визиты выросла до 68%. Отличный показатель удержания.",
    impact: "low",
    actionLabel: "Подробнее",
  },
];

export function generateForecastData(): ForecastDataPoint[] {
  const data: ForecastDataPoint[] = [];
  for (let i = 0; i < 12; i++) {
    const monthIdx = (currentMonth + i) % 12;
    const monthName = new Date(currentYear, monthIdx).toLocaleDateString("ru-RU", { month: "short" });
    const actualRevenue = monthlyRevenueData[i]?.revenue ?? null;

    if (i < 6) {
      data.push({ month: monthName, actual: actualRevenue, forecast: null, lowerBound: null, upperBound: null });
    } else {
      const trend = actualRevenue ? actualRevenue * (1 + (i - 5) * 0.04) : 300000 + (i - 5) * 15000;
      data.push({
        month: monthName,
        actual: null,
        forecast: Math.round(trend),
        lowerBound: Math.round(trend * 0.85),
        upperBound: Math.round(trend * 1.15),
      });
    }
  }
  return data;
}

export function calculateBusinessHealth(): BusinessHealth {
  return {
    score: 78,
    revenueTrend: "up",
    clientRetention: 72,
    utilization: 68,
    avgCheck: 4200,
    newClientsGrowth: 15,
  };
}

export function calculateMetrics(): MetricSummary {
  const totalRevenue = monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalAppointments = monthlyRevenueData.reduce((sum, d) => sum + d.appointments, 0);
  const totalNewClients = monthlyRevenueData.reduce((sum, d) => sum + d.newClients, 0);

  return {
    ltv: Math.round(totalRevenue / (totalNewClients || 1)),
    avgCheck: Math.round(totalRevenue / (totalAppointments || 1)),
    conversionRate: 68,
    retentionRate: 72,
    revenueGrowth: 14.8,
    clientGrowth: 22.3,
  };
}

export const comparisonData = {
  month: {
    current: { revenue: 290000, appointments: 79, newClients: 22 },
    previous: { revenue: 275000, appointments: 75, newClients: 20 },
  },
  quarter: {
    current: { revenue: 823000, appointments: 224, newClients: 58 },
    previous: { revenue: 743500, appointments: 203, newClients: 47 },
  },
  year: {
    current: { revenue: 3100000, appointments: 845, newClients: 203 },
    previous: { revenue: 2750000, appointments: 750, newClients: 165 },
  },
};
