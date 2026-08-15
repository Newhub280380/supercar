import { NextResponse } from "next/server";
import { generateRobotsTxt } from "@/lib/promotion-utils";
import { getPublicBaseUrl } from "@/lib/env";

export async function GET() {
  const txt = generateRobotsTxt(getPublicBaseUrl());
  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
