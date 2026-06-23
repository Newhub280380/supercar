import { NextRequest, NextResponse } from "next/server";
import { faqItems, searchFAQ, getProceduresByCategory, searchProcedures } from "@/lib/ai";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");

    if (query) {
      const results = searchFAQ(query);
      return NextResponse.json({ items: results });
    }

    if (category) {
      const procedures = getProceduresByCategory(category as never);
      return NextResponse.json({ procedures });
    }

    const proceduresSearch = searchParams.get("procedures");
    if (proceduresSearch) {
      const results = searchProcedures(proceduresSearch);
      return NextResponse.json({ procedures: results });
    }

    return NextResponse.json({
      items: faqItems,
      categories: [...new Set(faqItems.map((f) => f.category))],
    });
  } catch (error) {
    console.error("FAQ error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
