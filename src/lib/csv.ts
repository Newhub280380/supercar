import { downloadText, withExtension } from "./download";

export type CsvValue = string | number | null | undefined;

const BOM = "\uFEFF";

export function escapeCsv(value: CsvValue): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function csvRow(values: CsvValue[]): string {
  return values.map(escapeCsv).join(",");
}

export function buildCsv(rows: CsvValue[][]): string {
  return rows.map(csvRow).join("\n");
}

export function downloadCsv(content: string, filename: string): void {
  downloadText(
    BOM + content,
    withExtension(filename, "csv"),
    "text/csv;charset=utf-8;",
  );
}
