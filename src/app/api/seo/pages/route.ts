import { NextResponse } from "next/server";
import { SITE_PAGES } from "@/lib/site-pages";

export async function GET() {
  return NextResponse.json({ pages: SITE_PAGES });
}
