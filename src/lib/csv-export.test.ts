/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  exportAppointmentsCsv,
  exportClientsCsv,
  exportServicesCsv,
  exportToCsv,
} from "./csv-export";

interface CapturedDownload {
  type: string;
  filename: string;
}

let captured: CapturedDownload[];
let createObjectUrl: ReturnType<typeof vi.fn>;
let revokeObjectUrl: ReturnType<typeof vi.fn>;

function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

function blobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

beforeEach(() => {
  captured = [];
  createObjectUrl = vi.fn(() => "blob:mock-url");
  revokeObjectUrl = vi.fn();
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    }),
  );

  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    const blob = createObjectUrl.mock.calls.at(-1)![0] as Blob;
    captured.push({ type: blob.type, filename: this.download });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function lastBlob(): Blob {
  return createObjectUrl.mock.calls.at(-1)![0] as Blob;
}

describe("exportToCsv", () => {
  it("does nothing for an empty dataset", () => {
    exportToCsv([], "empty");
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("writes a header row derived from the first object and one row per record", async () => {
    exportToCsv(
      [
        { name: "Анна", visits: 3 },
        { name: "Мария", visits: 1 },
      ],
      "clients",
    );

    const text = await blobText(lastBlob());
    expect((await blobBytes(lastBlob())).slice(0, 3)).toEqual(
      new Uint8Array([0xef, 0xbb, 0xbf]),
    );
    expect(text.replace("\uFEFF", "").split("\n")).toEqual([
      "name,visits",
      "Анна,3",
      "Мария,1",
    ]);
  });

  it("quotes values containing commas, quotes or newlines and doubles inner quotes", async () => {
    exportToCsv(
      [
        {
          note: 'она сказала "да", потом ушла',
          multiline: "a\nb",
          plain: "ok",
        },
      ],
      "notes",
    );

    const rows = (await blobText(lastBlob())).replace("\uFEFF", "").split("\n");
    expect(rows[0]).toBe("note,multiline,plain");
    expect(rows[1]).toBe('"она сказала ""да"", потом ушла","a');
    expect(rows[2]).toBe('b",ok');
  });

  it("renders null and undefined values as empty cells", async () => {
    exportToCsv([{ a: null, b: undefined, c: 0 }], "nulls");
    expect((await blobText(lastBlob())).replace("\uFEFF", "")).toBe(
      "a,b,c\n,,0",
    );
  });

  it("uses the keys of the first row for every row", async () => {
    exportToCsv([{ a: 1 }, { a: 2, b: 3 } as { a: number }], "shape");
    expect((await blobText(lastBlob())).replace("\uFEFF", "")).toBe("a\n1\n2");
  });

  it("downloads a utf-8 csv named after the filename argument and revokes the url", () => {
    exportToCsv([{ a: 1 }], "report");
    expect(captured).toEqual([
      { type: "text/csv;charset=utf-8;", filename: "report.csv" },
    ]);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:mock-url");
  });
});

describe("domain csv helpers", () => {
  it("default the filename per entity", () => {
    exportAppointmentsCsv([{ id: "1" }]);
    exportClientsCsv([{ id: "1" }]);
    exportServicesCsv([{ id: "1" }]);

    expect(captured.map((c) => c.filename)).toEqual([
      "appointments.csv",
      "clients.csv",
      "services.csv",
    ]);
  });

  it("allow overriding the filename", () => {
    exportClientsCsv([{ id: "1" }], "vip-clients");
    expect(captured[0].filename).toBe("vip-clients.csv");
  });
});
