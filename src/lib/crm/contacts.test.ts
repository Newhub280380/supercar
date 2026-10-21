import { describe, expect, it } from "vitest";
import {
  detectDelimiter,
  instagramKey,
  matchContact,
  parseContactsCsv,
  parseContactStatus,
  phoneKey,
} from "./contacts";

describe("phoneKey", () => {
  it("keeps the last 10 digits of the first number", () => {
    expect(phoneKey("+7 (777) 123-45-67, 77011223344")).toBe("7771234567");
  });

  it("rejects too-short values", () => {
    expect(phoneKey("123")).toBeNull();
    expect(phoneKey("")).toBeNull();
    expect(phoneKey(null)).toBeNull();
  });
});

describe("instagramKey", () => {
  it("strips urls and @", () => {
    expect(instagramKey("https://instagram.com/Zishel.Clinic/?hl=ru")).toBe(
      "zishel.clinic",
    );
    expect(instagramKey("@Doctor_A")).toBe("doctor_a");
  });
});

describe("parseContactStatus", () => {
  it("maps russian labels and defaults empty to new", () => {
    expect(parseContactStatus("В работе")).toBe("contacted");
    expect(parseContactStatus("продажа")).toBe("won");
    expect(parseContactStatus("")).toBe("new");
    expect(parseContactStatus(null)).toBe("new");
  });

  it("rejects unknown labels", () => {
    expect(parseContactStatus("космонавт")).toBeNull();
  });
});

describe("parseContactsCsv", () => {
  it("reads a semicolon file with a BOM and quoted commas", () => {
    const csv = `\uFEFF имя;специальность;город;клиника;источник;телефоны;whatsapp;instagram;статус
"Алия, Нур";дерматолог;Алматы;Клиника А;выставка;+7 777 111 22 33;87771112233;@aliya;новый
;косметолог;Астана;Кабинет;сайт;77010000000;;;в работе
`;
    const parsed = parseContactsCsv(csv);
    expect(detectDelimiter("a;b;c")).toBe(";");
    expect(parsed.errors).toEqual([{ row: 3, message: "Пустое имя" }]);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]).toMatchObject({
      name: "Алия, Нур",
      specialty: "дерматолог",
      city: "Алматы",
      clinic: "Клиника А",
      source: "выставка",
      status: "new",
      phoneKey: "7771112233",
      instagramKey: "aliya",
    });
  });

  it("accepts english headers and reports an unknown status", () => {
    const csv = `name,specialty,city,clinic,source,phones,whatsapp,instagram,status
Dana,surgeon,Shymkent,D Clinic,instagram,77015556677,77015556677,dana,vip
`;
    const parsed = parseContactsCsv(csv);
    expect(parsed.rows).toHaveLength(0);
    expect(parsed.errors[0]?.message).toContain("vip");
  });

  it("asks for a name column when the header is missing", () => {
    const parsed = parseContactsCsv("foo,bar\n1,2");
    expect(parsed.rows).toHaveLength(0);
    expect(parsed.errors[0]?.message).toContain("имя");
  });
});

describe("matchContact", () => {
  const existing = [
    {
      id: "a",
      phoneKey: "7771112233",
      whatsappKey: null,
      instagramKey: "aliya",
    },
  ];

  it("matches phone, whatsapp or instagram", () => {
    expect(
      matchContact(existing, {
        phoneKey: "7771112233",
        whatsappKey: null,
        instagramKey: null,
      }),
    ).toBe("a");
    expect(
      matchContact(existing, {
        phoneKey: null,
        whatsappKey: null,
        instagramKey: "aliya",
      }),
    ).toBe("a");
  });

  it("does not match an empty identity", () => {
    expect(
      matchContact(existing, {
        phoneKey: null,
        whatsappKey: null,
        instagramKey: null,
      }),
    ).toBeNull();
  });
});
