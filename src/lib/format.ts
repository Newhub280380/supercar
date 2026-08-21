export const LOCALE = "ru-RU";

type DateInput = Date | string | number;

const DATE_FORMATS = {
  numeric: {},
  dayMonth: { day: "numeric", month: "short" },
  dayMonthYear: { day: "numeric", month: "short", year: "numeric" },
  monthYear: { month: "long", year: "numeric" },
  month: { month: "short" },
  long: { day: "numeric", month: "long", year: "numeric" },
  weekdayLong: { weekday: "long", day: "numeric", month: "long" },
  weekdayLongYear: {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  },
  weekdayShort: { weekday: "short", day: "numeric", month: "long" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateFormat = keyof typeof DATE_FORMATS;

export function formatNumber(value: number): string {
  return value.toLocaleString(LOCALE);
}

export function formatCurrency(value: number): string {
  return `₽${formatNumber(value)}`;
}

/** Currency shortened to k/M above a thousand, for chart axes and tooltips. */
export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `₽${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₽${(value / 1_000).toFixed(0)}k`;
  return formatCurrency(value);
}

export function formatDate(
  date: DateInput,
  format: DateFormat = "numeric",
): string {
  return new Date(date).toLocaleDateString(LOCALE, DATE_FORMATS[format]);
}

export function toIsoDate(date: DateInput = new Date()): string {
  return new Date(date).toISOString().split("T")[0];
}
