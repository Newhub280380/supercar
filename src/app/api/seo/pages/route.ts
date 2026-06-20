import { NextRequest, NextResponse } from "next/server";

const MOCK_SEO_PAGES = [
  { pageUrl: "/", updatedAt: "2026-06-01" },
  { pageUrl: "/about", updatedAt: "2026-05-15" },
  { pageUrl: "/pricing", updatedAt: "2026-04-20" },
  { pageUrl: "/contact", updatedAt: "2026-03-10" },
  { pageUrl: "/services/biorevitalization", updatedAt: "2026-06-10" },
  { pageUrl: "/services/chemical-peeling", updatedAt: "2026-05-25" },
];

export async function GET(_request: NextRequest) {
  return NextResponse.json({ pages: MOCK_SEO_PAGES });
}
