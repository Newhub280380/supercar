import { NextRequest, NextResponse } from "next/server";
import { generateRobotsTxt } from "@/lib/promotion-utils";

export async function GET(_request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const txt = generateRobotsTxt(baseUrl);
  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
