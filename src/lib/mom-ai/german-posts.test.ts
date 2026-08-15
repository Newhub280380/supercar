import { describe, expect, it } from "vitest";
import { buildFallbackPost, generateGermanPosts } from "./german-posts";

describe("generateGermanPosts", () => {
  it("returns posts with a title, body, hashtags and a known platform", () => {
    const posts = generateGermanPosts();
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      expect(post.title).not.toBe("");
      expect(post.body.length).toBeGreaterThan(100);
      expect(post.hashtags.length).toBeGreaterThan(0);
      expect(post.hashtags.every((tag) => tag.startsWith("#"))).toBe(true);
      expect(["instagram", "facebook", "blog"]).toContain(post.platform);
    }
  });

  it("returns unique titles", () => {
    const titles = generateGermanPosts().map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("returns a fresh array on every call", () => {
    const first = generateGermanPosts();
    const second = generateGermanPosts();
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});

describe("buildFallbackPost", () => {
  it("picks the self-care post for self-care topics", () => {
    expect(buildFallbackPost("Selbstfürsorge im Alltag").title).toContain(
      "Selbstfürsorge",
    );
  });

  it("picks the parental leave post for Elternzeit and Elterngeld topics", () => {
    expect(buildFallbackPost("elternzeit planen").title).toContain(
      "Elternzeit",
    );
    expect(buildFallbackPost("Wie viel Elterngeld?").title).toContain(
      "Elternzeit",
    );
  });

  it("picks the childcare post for Kita and Betreuung topics", () => {
    expect(buildFallbackPost("KITA-Platz gesucht").title).toContain("Kita");
    expect(buildFallbackPost("Betreuung organisieren").title).toContain("Kita");
  });

  it("picks the breastfeeding post for Still and Baby topics", () => {
    expect(buildFallbackPost("stillen tut weh").title).toContain(
      "Stillsituation",
    );
    expect(buildFallbackPost("Baby schläft nicht").title).toContain(
      "Stillsituation",
    );
  });

  it("falls back to the me-time post for unrelated topics", () => {
    expect(buildFallbackPost("Steuererklärung").title).toContain("Me-Time");
  });
});
