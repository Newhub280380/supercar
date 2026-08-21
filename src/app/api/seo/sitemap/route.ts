import { NextResponse } from "next/server";
import { generateSitemapXml } from "@/lib/promotion-utils";
import { getPublicBaseUrl } from "@/lib/env";
import { SITE_PAGES } from "@/lib/site-pages";

export async function GET() {
  const xml = generateSitemapXml(SITE_PAGES, getPublicBaseUrl());
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
