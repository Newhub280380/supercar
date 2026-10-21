import { contactStatusEnum } from "@/db/schema";

export const CONTACT_STATUSES = contactStatusEnum.enumValues;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: "Новый",
  contacted: "В работе",
  qualified: "Квалифицирован",
  won: "Продажа",
  lost: "Потерян",
  paused: "Пауза",
};

const STATUS_ALIASES: Record<string, ContactStatus> = {
  new: "new",
  новый: "new",
  новая: "new",
  новое: "new",
  contacted: "contacted",
  "в работе": "contacted",
  связались: "contacted",
  контакт: "contacted",
  qualified: "qualified",
  квалифицирован: "qualified",
  квалифицирована: "qualified",
  won: "won",
  продажа: "won",
  клиент: "won",
  купил: "won",
  купила: "won",
  lost: "lost",
  потерян: "lost",
  потеряна: "lost",
  отказ: "lost",
  paused: "paused",
  пауза: "paused",
  "не беспокоить": "paused",
};

/** Заголовки CSV: русские названия из выгрузки и английские алиасы. */
const HEADER_ALIASES: Record<keyof ContactCsvFields, string[]> = {
  name: ["имя", "фио", "name", "fullname", "full_name"],
  specialty: ["специальность", "специализация", "specialty", "speciality"],
  city: ["город", "city"],
  clinic: ["клиника", "кабинет", "clinic", "company"],
  source: ["источник", "source"],
  phones: ["телефоны", "телефон", "phones", "phone", "тел"],
  whatsapp: ["whatsapp", "ватсап", "wa", "вотсап"],
  instagram: ["instagram", "инстаграм", "insta", "ig"],
  status: ["статус", "status"],
};

export type ContactCsvFields = {
  name: string;
  specialty: string | null;
  city: string | null;
  clinic: string | null;
  source: string | null;
  phones: string | null;
  whatsapp: string | null;
  instagram: string | null;
  status: ContactStatus;
};

export type ParsedContactRow = ContactCsvFields & {
  rowNumber: number;
  phoneKey: string | null;
  whatsappKey: string | null;
  instagramKey: string | null;
};

export type CsvImportIssue = { row: number; message: string };

export type ParsedContactsCsv = {
  rows: ParsedContactRow[];
  errors: CsvImportIssue[];
};

const LIMITS = {
  name: 200,
  text: 300,
  phones: 500,
};

export function isContactStatus(value: string): value is ContactStatus {
  return (CONTACT_STATUSES as readonly string[]).includes(value);
}

export function parseContactStatus(value: string | null | undefined): ContactStatus | null {
  if (!value || !value.trim()) return "new";
  const key = value.trim().toLowerCase().replace(/\s+/g, " ");
  return STATUS_ALIASES[key] ?? null;
}

/** Последние 10 цифр первого номера. Короче 6 цифр — ключа нет. */
export function phoneKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const first = value.split(/[,;/|]/)[0] ?? value;
  const digits = first.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return digits.slice(-10);
}

/** Ник без @, URL и хвоста запроса. */
export function instagramKey(value: string | null | undefined): string | null {
  if (!value) return null;
  let handle = value.trim().toLowerCase();
  handle = handle.replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
  handle = handle.replace(/^@/, "");
  handle = handle.split(/[/?#\s]/)[0] ?? "";
  handle = handle.replace(/[^a-z0-9._]/g, "");
  return handle || null;
}

function clip(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.*:]+$/g, "");
}

export function detectDelimiter(headerLine: string): "," | ";" | "\t" {
  const counts: Array<["," | ";" | "\t", number]> = [
    [",", (headerLine.match(/,/g) ?? []).length],
    [";", (headerLine.match(/;/g) ?? []).length],
    ["\t", (headerLine.match(/\t/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

/** RFC-стиль: кавычки, удвоенные кавычки, переносы внутри поля. */
export function parseCsv(text: string, delimiter: string): string[][] {
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.length > 0));
}

function headerIndex(headers: string[]): Partial<Record<keyof ContactCsvFields, number>> {
  const map: Partial<Record<keyof ContactCsvFields, number>> = {};
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    for (const field of Object.keys(HEADER_ALIASES) as (keyof ContactCsvFields)[]) {
      if (map[field] !== undefined) continue;
      if (HEADER_ALIASES[field].includes(normalized)) map[field] = index;
    }
  });
  return map;
}

export function parseContactsCsv(text: string): ParsedContactsCsv {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) {
    return { rows: [], errors: [{ row: 1, message: "Файл пустой" }] };
  }

  const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  const table = parseCsv(trimmed, delimiter);
  if (table.length === 0) {
    return { rows: [], errors: [{ row: 1, message: "Файл пустой" }] };
  }

  const columns = headerIndex(table[0]);
  if (columns.name === undefined) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message:
            "В первой строке нужна колонка «имя» (также принимаются name, фио)",
        },
      ],
    };
  }

  const rows: ParsedContactRow[] = [];
  const errors: CsvImportIssue[] = [];

  for (let i = 1; i < table.length; i += 1) {
    const cells = table[i];
    const rowNumber = i + 1;
    const read = (field: keyof ContactCsvFields): string | null => {
      const index = columns[field];
      if (index === undefined) return null;
      return cells[index] ?? null;
    };

    const name = clip(read("name"), LIMITS.name);
    if (!name) {
      errors.push({ row: rowNumber, message: "Пустое имя" });
      continue;
    }

    const statusRaw = read("status");
    const status = parseContactStatus(statusRaw);
    if (!status) {
      errors.push({
        row: rowNumber,
        message: `Неизвестный статус «${statusRaw}»`,
      });
      continue;
    }

    const phones = clip(read("phones"), LIMITS.phones);
    const whatsapp = clip(read("whatsapp"), LIMITS.phones);
    const instagram = clip(read("instagram"), LIMITS.text);

    rows.push({
      rowNumber,
      name,
      specialty: clip(read("specialty"), LIMITS.text),
      city: clip(read("city"), LIMITS.text),
      clinic: clip(read("clinic"), LIMITS.text),
      source: clip(read("source"), LIMITS.text),
      phones,
      whatsapp,
      instagram,
      status,
      phoneKey: phoneKey(phones),
      whatsappKey: phoneKey(whatsapp),
      instagramKey: instagramKey(instagram),
    });
  }

  return { rows, errors };
}

export type ContactIdentity = {
  id: string;
  phoneKey: string | null;
  whatsappKey: string | null;
  instagramKey: string | null;
};

/** Совпадение по телефону, WhatsApp или Instagram внутри базы владельца. */
export function matchContact(
  existing: ContactIdentity[],
  row: Pick<ContactIdentity, "phoneKey" | "whatsappKey" | "instagramKey">,
): string | null {
  for (const item of existing) {
    if (row.phoneKey && item.phoneKey === row.phoneKey) return item.id;
    if (row.whatsappKey && item.whatsappKey === row.whatsappKey) return item.id;
    if (row.instagramKey && item.instagramKey === row.instagramKey) return item.id;
  }
  return null;
}

export type ContactWrite = ContactCsvFields & {
  phoneKey: string | null;
  whatsappKey: string | null;
  instagramKey: string | null;
};

export function contactFromBody(
  data: Record<string, unknown>,
): { ok: true; value: ContactWrite } | { ok: false; error: string } {
  const read = (key: string, max: number): string | null => {
    const value = data[key];
    if (value == null) return null;
    if (typeof value !== "string") return null;
    return clip(value, max);
  };

  const name = read("name", LIMITS.name);
  if (!name) return { ok: false, error: "Нужно имя" };

  const statusValue = data.status;
  const status =
    statusValue == null || statusValue === ""
      ? "new"
      : typeof statusValue === "string"
        ? parseContactStatus(statusValue)
        : null;
  if (!status) return { ok: false, error: "Неверный статус" };

  const phones = read("phones", LIMITS.phones);
  const whatsapp = read("whatsapp", LIMITS.phones);
  const instagram = read("instagram", LIMITS.text);

  return {
    ok: true,
    value: {
      name,
      specialty: read("specialty", LIMITS.text),
      city: read("city", LIMITS.text),
      clinic: read("clinic", LIMITS.text),
      source: read("source", LIMITS.text),
      phones,
      whatsapp,
      instagram,
      status,
      phoneKey: phoneKey(phones),
      whatsappKey: phoneKey(whatsapp),
      instagramKey: instagramKey(instagram),
    },
  };
}
