import { NextRequest, NextResponse } from "next/server";
import { runConvoy } from "@/lib/mom-ai/convoy.runner";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
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
    return NextResponse.json({ summary: result.summary });
  } catch (err) {
    console.error("Convoy error:", err);
    return NextResponse.json({ error: "Convoy failed" }, { status: 500 });
  }
}
