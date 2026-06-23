import { CONVOY_STEPS } from "./convoy.config";
import { generateGermanPosts } from "./german-posts";
import { generateMomImages } from "./image-generator";
import { generateLandingContent } from "./landing-generator";

export async function runConvoy(): Promise<{
  summary: {
    project: string;
    startedAt: string;
    finishedAt: string;
    steps: Array<{
      stepId: string;
      success: boolean;
      output?: unknown;
      error?: string;
      durationMs: number;
    }>;
    posts: string[];
    images: string[];
    landing: { title: string; sections: string[] };
  };
}> {
  const startedAt = new Date().toISOString();
  const results: Array<{
    stepId: string;
    success: boolean;
    output?: unknown;
    error?: string;
    durationMs: number;
  }> = [];

  let posts: string[] = [];
  let images: string[] = [];
  let landing: { title: string; sections: string[] } = { title: "", sections: [] };

  for (const step of CONVOY_STEPS) {
    const t0 = Date.now();
    try {
      let output: unknown;
      if (step.id === "generate_posts") {
        output = (await import("@/lib/mom-ai/convoy.config")).CONVOY_STEPS[0].run();
        posts = [];
      } else if (step.id === "generate_images") {
        output = await generateMomImages(posts.map((title) => ({ title })));
        images = output as string[];
      } else if (step.id === "generate_landing") {
        output = await generateLandingContent(posts.map((title) => ({ title, body: "" })), images);
        landing = output as { title: string; sections: string[] };
      }
      results.push({
        stepId: step.id,
        success: true,
        output,
        durationMs: Date.now() - t0,
      });
    } catch (err) {
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
      startedAt,
      finishedAt: new Date().toISOString(),
      steps: results,
      posts,
      images,
      landing,
    },
  };
}
