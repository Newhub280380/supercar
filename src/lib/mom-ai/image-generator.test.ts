import { describe, expect, it } from "vitest";
import { generateImageFromPrompt, generateMomImages } from "./image-generator";

describe("generateMomImages", () => {
  it("returns a pollinations url per preset prompt", async () => {
    const urls = await generateMomImages([]);
    expect(urls.length).toBeGreaterThan(0);
    expect(
      urls.every((url) =>
        url.startsWith("https://image.pollinations.ai/prompt/"),
      ),
    ).toBe(true);
  });

  it("encodes the prompt and passes size and nologo params", async () => {
    const [first] = await generateMomImages([{ title: "irrelevant" }]);
    const url = new URL(first);

    expect(url.pathname).not.toContain(" ");
    expect(url.searchParams.get("width")).toBe("1024");
    expect(url.searchParams.get("height")).toBe("1024");
    expect(url.searchParams.get("nologo")).toBe("true");
    expect(Number(url.searchParams.get("seed"))).toBeGreaterThanOrEqual(0);
  });

  it("includes a wide hero image among the presets", async () => {
    const urls = await generateMomImages([]);
    expect(urls.some((url) => url.includes("width=1200&height=630"))).toBe(
      true,
    );
  });

  it("ignores the posts argument", async () => {
    const withPosts = await generateMomImages([{ title: "a" }, { title: "b" }]);
    const withoutPosts = await generateMomImages([]);
    expect(withPosts).toHaveLength(withoutPosts.length);
  });
});

describe("generateImageFromPrompt", () => {
  it("echoes the prompt and the default dimensions", async () => {
    const image = await generateImageFromPrompt("a mother and her baby");

    expect(image.prompt).toBe("a mother and her baby");
    expect(image.width).toBe(1024);
    expect(image.height).toBe(1024);
    expect(image.url).toContain(encodeURIComponent("a mother and her baby"));
  });

  it("honours custom dimensions", async () => {
    const image = await generateImageFromPrompt("hero", 1200, 630);
    expect(image.url).toContain("width=1200&height=630");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
  });

  it("varies the seed between calls", async () => {
    const urls = await Promise.all(
      Array.from({ length: 8 }, () => generateImageFromPrompt("same prompt")),
    );
    expect(new Set(urls.map((i) => i.url)).size).toBeGreaterThan(1);
  });
});
