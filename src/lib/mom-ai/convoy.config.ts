export interface ConvoyStep {
  id: string;
  name: string;
  run: () => Promise<ConvoyResult>;
  dependsOn?: string[];
}

export interface ConvoyResult {
  stepId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
}

export interface ConvoyRunSummary {
  project: string;
  startedAt: string;
  finishedAt: string;
  steps: ConvoyResult[];
  posts: string[];
  images: string[];
  landing: { title: string; sections: string[] };
}

export const CONVOY_STEPS: ConvoyStep[] = [
  {
    id: "generate_posts",
    name: "Generate German Social Posts",
    run: generatePostsStep,
  },
  {
    id: "generate_images",
    name: "Generate Landing Images",
    run: generateImagesStep,
    dependsOn: ["generate_posts"],
  },
  {
    id: "generate_landing",
    name: "Build Landing Page Content",
    run: generateLandingStep,
    dependsOn: ["generate_posts", "generate_images"],
  },
];

let postsCache: string[] | null = null;
let imagesCache: string[] | null = null;

async function generatePostsStep(): Promise<ConvoyResult> {
  const t0 = Date.now();
  try {
    const { generateGermanPosts } = await import("@/lib/mom-ai/german-posts");
    postsCache = generateGermanPosts().map((p) => p.title);
    return { stepId: "generate_posts", success: true, output: postsCache, durationMs: Date.now() - t0 };
  } catch (err) {
    return { stepId: "generate_posts", success: false, error: err instanceof Error ? err.message : "Unknown error", durationMs: Date.now() - t0 };
  }
}

async function generateImagesStep(): Promise<ConvoyResult> {
  const t0 = Date.now();
  try {
    const { generateMomImages } = await import("@/lib/mom-ai/image-generator");
    imagesCache = await generateMomImages([]);
    return { stepId: "generate_images", success: true, output: imagesCache, durationMs: Date.now() - t0 };
  } catch (err) {
    return { stepId: "generate_images", success: false, error: err instanceof Error ? err.message : "Unknown error", durationMs: Date.now() - t0 };
  }
}

async function generateLandingStep(): Promise<ConvoyResult> {
  const t0 = Date.now();
  try {
    const { generateLandingContent } = await import("@/lib/mom-ai/landing-generator");
    const posts = postsCache ?? [];
    const images = imagesCache ?? [];
    const output = await generateLandingContent(posts.map((t) => ({ title: t, body: "" })), images);
    return { stepId: "generate_landing", success: true, output, durationMs: Date.now() - t0 };
  } catch (err) {
    return { stepId: "generate_landing", success: false, error: err instanceof Error ? err.message : "Unknown error", durationMs: Date.now() - t0 };
  }
}
