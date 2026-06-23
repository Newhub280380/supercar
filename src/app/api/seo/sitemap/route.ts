import { NextRequest, NextResponse } from "next/server";
import { generateSitemapXml } from "@/lib/promotion-utils";

const SITEMAP_PAGES = [
  { pageUrl: "/", updatedAt: "2026-06-01" },
  { pageUrl: "/about", updatedAt: "2026-05-15" },
  { pageUrl: "/pricing", updatedAt: "2026-04-20" },
  { pageUrl: "/contact", updatedAt: "2026-03-10" },
  { pageUrl: "/services/biorevitalization", updatedAt: "2026-06-10" },
  { pageUrl: "/services/chemical-peeling", updatedAt: "2026-05-25" },
];

export async function GET(_request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const xml = generateSitemapXml(SITEMAP_PAGES, baseUrl);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
