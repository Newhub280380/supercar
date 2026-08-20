import { NextRequest, NextResponse } from "next/server";
import { runConvoy } from "@/lib/mom-ai/convoy.runner";
import { parseJsonBody } from "@/lib/api-utils";
import { withErrorHandling } from "@/lib/api/response";

export const POST = withErrorHandling(
  "Convoy error",
  async (request: NextRequest) => {
    const { data: body, error } = await parseJsonBody(request);
    if (error) return error;
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
    if (!result.summary.success) {
      const failed = result.summary.steps.filter((s) => !s.success);
      console.error(
        "Convoy run finished with failed steps:",
        failed.map((s) => `${s.stepId}: ${s.error}`).join("; "),
      );
      return NextResponse.json(
        { error: "Convoy failed", summary: result.summary },
        { status: 500 },
      );
    }
    return NextResponse.json({ summary: result.summary });
  },
  "Convoy failed",
);
