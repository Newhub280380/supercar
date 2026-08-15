import { NextRequest, NextResponse } from "next/server";
import { runConvoy } from "@/lib/mom-ai/convoy.runner";
import { parseJsonBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseJsonBody(request);
    if (error) return error;
    const { step } = body;

    if (step === "posts") {
      const { generateGermanPosts } = await import("@/lib/mom-ai/german-posts");
      const posts = generateGermanPosts();
      return NextResponse.json({ posts });
    }

    if (step === "images") {
      const { generateMomImages } = await import("@/lib/mom-ai/image-generator");
      const images = await generateMomImages([]);
      return NextResponse.json({ images });
    }

    if (step === "landing") {
      const { generateLandingContent } = await import("@/lib/mom-ai/landing-generator");
      const content = await generateLandingContent([], []);
      return NextResponse.json({ landing: content });
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
  } catch (err) {
    console.error("Convoy error:", err);
    return NextResponse.json({ error: "Convoy failed" }, { status: 500 });
  }
}
