import { NextRequest, NextResponse } from "next/server";
import { runConvoy } from "@/lib/mom-ai/convoy.runner";
import { withErrorHandling } from "@/lib/api/response";

export const POST = withErrorHandling(
  "Convoy error",
  async (request: NextRequest) => {
    const body = await request.json().catch(() => ({}));
    const { step } = body;

    if (step === "posts") {
      const { generateGermanPosts } = await import("@/lib/mom-ai/german-posts");
      return NextResponse.json({ posts: generateGermanPosts() });
    }

    if (step === "images") {
      const { generateMomImages } = await import("@/lib/mom-ai/image-generator");
      return NextResponse.json({ images: await generateMomImages([]) });
    }

    if (step === "landing") {
      const { generateLandingContent } = await import("@/lib/mom-ai/landing-generator");
      return NextResponse.json({ landing: await generateLandingContent([], []) });
    }

    const result = await runConvoy();
    return NextResponse.json({ summary: result.summary });
  },
  "Convoy failed",
);
