/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  copyToClipboard,
  exportAsHTML,
  exportAsTXT,
  getCharCount,
  getWordCount,
} from "./export-utils";

let createObjectUrl: ReturnType<typeof vi.fn>;
let revokeObjectUrl: ReturnType<typeof vi.fn>;
let filenames: string[];

function blobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function lastBlob(): Blob {
  return createObjectUrl.mock.calls.at(-1)![0] as Blob;
}

beforeEach(() => {
  filenames = [];
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
    filenames.push(this.download);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("exportAsTXT", () => {
  it("downloads the raw content as a text blob", async () => {
    exportAsTXT("Привет мир", "post");
    expect(await blobText(lastBlob())).toBe("Привет мир");
    expect(lastBlob().type).toBe("text/plain;charset=utf-8");
    expect(filenames).toEqual(["post.txt"]);
  });

  it("does not duplicate an existing .txt extension", () => {
    exportAsTXT("x", "post.txt");
    expect(filenames).toEqual(["post.txt"]);
  });

  it("cleans up the object url and leaves no anchor behind", () => {
    exportAsTXT("x", "post");
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:mock-url");
    expect(document.querySelectorAll("a")).toHaveLength(0);
  });
});

describe("exportAsHTML", () => {
  it("wraps the content in an html document titled after the file", async () => {
    exportAsHTML("plain text", "report");
    const html = await blobText(lastBlob());
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain("<title>report</title>");
    expect(html).toContain('<html lang="ru">');
    expect(lastBlob().type).toBe("text/html;charset=utf-8");
    expect(filenames).toEqual(["report.html"]);
  });

  it("converts markdown headings, emphasis and bullets", async () => {
    exportAsHTML("# H1\n## H2\n### H3\n**bold** and *italic*\n• item", "doc");
    const html = await blobText(lastBlob());
    expect(html).toContain("<h1>H1</h1>");
    expect(html).toContain("<h2>H2</h2>");
    expect(html).toContain("<h3>H3</h3>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<li>item</li>");
    expect(html).toContain("<ul>");
  });

  it("does not duplicate an existing .html extension", () => {
    exportAsHTML("x", "report.html");
    expect(filenames).toEqual(["report.html"]);
  });
});

describe("copyToClipboard", () => {
  it("uses the async clipboard api when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await copyToClipboard("текст");
    expect(writeText).toHaveBeenCalledWith("текст");
  });

  it("falls back to a temporary textarea and execCommand", async () => {
    vi.stubGlobal("navigator", {});
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
      writable: true,
    });

    await copyToClipboard("текст");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelectorAll("textarea")).toHaveLength(0);
  });
});

describe("getWordCount", () => {
  it("counts whitespace separated words", () => {
    expect(getWordCount("один два три")).toBe(3);
  });

  it("ignores extra whitespace and newlines", () => {
    expect(getWordCount("  один \n\n два\t\tтри  ")).toBe(3);
  });

  it("returns 0 for empty or blank text", () => {
    expect(getWordCount("")).toBe(0);
    expect(getWordCount("   ")).toBe(0);
  });
});

describe("getCharCount", () => {
  it("counts every character including whitespace", () => {
    expect(getCharCount("ab c")).toBe(4);
    expect(getCharCount("")).toBe(0);
  });
});
