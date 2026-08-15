import { buildCsv, downloadCsv, type CsvValue } from "./csv";

type CsvRecord = Record<string, CsvValue>;

export function exportToCsv<T extends CsvRecord>(data: T[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => row[h]));

  downloadCsv(buildCsv([headers, ...rows]), filename);
}

export function exportAppointmentsCsv(data: CsvRecord[], filename = "appointments") {
  exportToCsv(data, filename);
}

export function exportClientsCsv(data: CsvRecord[], filename = "clients") {
  exportToCsv(data, filename);
}

export function exportServicesCsv(data: CsvRecord[], filename = "services") {
  exportToCsv(data, filename);
}
