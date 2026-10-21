import { NextResponse } from "next/server";
import { db } from "@/db";
import { seoPages } from "@/db/schema";
import { SITE_PAGES } from "@/lib/site-pages";

/**
 * Реальные публичные URL из карты сайта плюс сохранённые meta из базы.
 * Пустые title/description — честный пробел, а не выдуманные оценки.
 */
export async function GET() {
  let stored: Array<{
    pageUrl: string;
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string | null;
    ogImage: string | null;
  }> = [];
  try {
    stored = await db
      .select({
        pageUrl: seoPages.pageUrl,
        metaTitle: seoPages.metaTitle,
        metaDescription: seoPages.metaDescription,
        keywords: seoPages.keywords,
        ogImage: seoPages.ogImage,
      })
      .from(seoPages);
  } catch {
    stored = [];
  }

  const byUrl = new Map(stored.map((row) => [row.pageUrl, row]));
  const urls = new Set<string>([
    ...SITE_PAGES.map((page) => page.pageUrl),
    ...stored.map((row) => row.pageUrl),
  ]);

  const pages = [...urls].map((pageUrl) => {
    const row = byUrl.get(pageUrl);
    const metaTitle = row?.metaTitle ?? "";
    const metaDescription = row?.metaDescription ?? "";
    const keywords = row?.keywords ?? "";
    return {
      id: pageUrl,
      pageUrl,
      metaTitle,
      metaDescription,
      keywords,
      ogImage: row?.ogImage ?? null,
      hasTitle: metaTitle.length > 0,
      hasDescription: metaDescription.length > 0,
      hasKeywords: keywords.length > 0,
      titleLength: metaTitle.length,
      descriptionLength: metaDescription.length,
    };
  });

  return NextResponse.json({ pages });
}
