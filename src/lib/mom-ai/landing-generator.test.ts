import { describe, expect, it } from "vitest";
import { generateLandingContent } from "./landing-generator";

describe("generateLandingContent", () => {
  it("returns a titled landing page with sections, features and testimonials", async () => {
    const content = await generateLandingContent([], []);

    expect(content.title).toContain("Mom AI Assistant");
    expect(content.subtitle.length).toBeGreaterThan(20);
    expect(content.sections.length).toBeGreaterThan(0);
    expect(content.features.length).toBeGreaterThan(0);
    expect(content.testimonials.length).toBeGreaterThan(0);
  });

  it("gives every section a heading and body and every feature an icon", async () => {
    const content = await generateLandingContent([], []);

    for (const section of content.sections) {
      expect(section.heading).not.toBe("");
      expect(section.body.length).toBeGreaterThan(20);
    }
    for (const feature of content.features) {
      expect(feature.title).not.toBe("");
      expect(feature.icon).not.toBe("");
    }
  });

  it("returns seo metadata within recommended lengths", async () => {
    const { seo } = await generateLandingContent([], []);

    expect(seo.metaTitle.length).toBeLessThanOrEqual(70);
    expect(seo.metaDescription.length).toBeGreaterThan(100);
    expect(seo.keywords.length).toBeGreaterThan(3);
  });

  it("produces the same content regardless of posts and images", async () => {
    const withInput = await generateLandingContent(
      [{ title: "Post", body: "Body" }],
      ["https://example.com/a.png"],
    );
    expect(withInput).toEqual(await generateLandingContent([], []));
  });
});
