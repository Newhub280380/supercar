import {
  CONVOY_STEPS,
  type ConvoyResult,
  type ConvoyRunSummary,
} from "./convoy.config";
import { generateGermanPosts } from "./german-posts";
import { generateMomImages } from "./image-generator";
import {
  generateLandingContent,
  type LandingContent,
} from "./landing-generator";

export async function runConvoy(): Promise<{ summary: ConvoyRunSummary }> {
  const startedAt = new Date().toISOString();
  const results: ConvoyResult[] = [];

  let posts: string[] = [];
  let images: string[] = [];
  let landing: LandingContent | null = null;

  for (const step of CONVOY_STEPS) {
    const t0 = Date.now();

    const unmetDependencies = (step.dependsOn ?? []).filter(
      (id) => !results.some((r) => r.stepId === id && r.success),
    );
    if (unmetDependencies.length > 0) {
      const error = `Skipped: dependencies failed (${unmetDependencies.join(", ")})`;
      console.error(`Convoy step "${step.id}" skipped:`, error);
      results.push({ stepId: step.id, success: false, error, durationMs: 0 });
      continue;
    }

    try {
      let output: unknown;
      if (step.id === "generate_posts") {
        posts = generateGermanPosts().map((p) => p.title);
        output = posts;
      } else if (step.id === "generate_images") {
        images = await generateMomImages(posts.map((title) => ({ title })));
        output = images;
      } else if (step.id === "generate_landing") {
        landing = await generateLandingContent(
          posts.map((title) => ({ title, body: "" })),
          images,
        );
        output = landing;
      } else {
        throw new Error(`Unknown convoy step: ${step.id}`);
      }
      results.push({
        stepId: step.id,
        success: true,
        output,
        durationMs: Date.now() - t0,
      });
    } catch (err) {
      console.error(`Convoy step "${step.id}" failed:`, err);
      results.push({
        stepId: step.id,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        durationMs: Date.now() - t0,
      });
    }
  }

  return {
    summary: {
      project: "Mom AI Assistant",
      success: results.every((r) => r.success),
      startedAt,
      finishedAt: new Date().toISOString(),
      steps: results,
      posts,
      images,
      landing,
    },
  };
}
