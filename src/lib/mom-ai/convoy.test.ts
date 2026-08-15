import { describe, expect, it } from "vitest";
import { CONVOY_STEPS } from "./convoy.config";
import { runConvoy } from "./convoy.runner";

describe("CONVOY_STEPS", () => {
  it("declares the three pipeline steps with their dependencies", () => {
    expect(CONVOY_STEPS.map((step) => step.id)).toEqual([
      "generate_posts",
      "generate_images",
      "generate_landing",
    ]);
    expect(CONVOY_STEPS[0].dependsOn).toBeUndefined();
    expect(CONVOY_STEPS[1].dependsOn).toEqual(["generate_posts"]);
    expect(CONVOY_STEPS[2].dependsOn).toEqual([
      "generate_posts",
      "generate_images",
    ]);
  });

  it("only depends on steps declared earlier in the pipeline", () => {
    const seen = new Set<string>();
    for (const step of CONVOY_STEPS) {
      for (const dependency of step.dependsOn ?? []) {
        expect(seen).toContain(dependency);
      }
      seen.add(step.id);
    }
  });

  it("runs each step successfully and reports a duration", async () => {
    for (const step of CONVOY_STEPS) {
      const result = await step.run();
      expect(result.stepId).toBe(step.id);
      expect(result.success).toBe(true);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("produces post titles, image urls and landing content as step output", async () => {
    const [posts, images, landing] = await Promise.all(
      CONVOY_STEPS.map((step) => step.run()),
    );

    expect((posts.output as string[]).length).toBeGreaterThan(0);
    expect((images.output as string[])[0]).toContain("pollinations.ai");
    expect(landing.output).toMatchObject({
      title: expect.stringContaining("Mom AI"),
    });
  });
});

describe("runConvoy", () => {
  it("reports every step as successful", async () => {
    const { summary } = await runConvoy();

    expect(summary.steps.map((step) => step.stepId)).toEqual([
      "generate_posts",
      "generate_images",
      "generate_landing",
    ]);
    expect(summary.steps.every((step) => step.success)).toBe(true);
  });

  it("returns the project name and a chronological time range", async () => {
    const { summary } = await runConvoy();

    expect(summary.project).toBe("Mom AI Assistant");
    expect(Date.parse(summary.finishedAt)).toBeGreaterThanOrEqual(
      Date.parse(summary.startedAt),
    );
  });

  it("returns the generated landing content in the summary", async () => {
    const { summary } = await runConvoy();
    expect(summary.landing?.title).toContain("Mom AI Assistant");
  });
});
