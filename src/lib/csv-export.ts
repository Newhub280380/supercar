function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv<T extends Record<string, string | number | null | undefined>>(
  data: T[],
  filename: string,
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => escapeCsv(row[h])));
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAppointmentsCsv(data: Array<Record<string, string | number | null | undefined>>, filename = "appointments") {
  exportToCsv(data, filename);
}

export function exportClientsCsv(data: Array<Record<string, string | number | null | undefined>>, filename = "clients") {
  exportToCsv(data, filename);
}

export function exportServicesCsv(data: Array<Record<string, string | number | null | undefined>>, filename = "services") {
  exportToCsv(data, filename);
}
