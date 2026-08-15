import { NextRequest, NextResponse } from "next/server";
import { faqItems, searchFAQ, getProceduresByCategory, searchProcedures } from "@/lib/ai";
import { withErrorHandling } from "@/lib/api/response";
import { getSearchParam } from "@/lib/api/request";

export const GET = withErrorHandling("FAQ error", async (request: NextRequest) => {
  const query = getSearchParam(request, "q");
  if (query) {
    return NextResponse.json({ items: searchFAQ(query) });
  }

  const category = getSearchParam(request, "category");
  if (category) {
    return NextResponse.json({ procedures: getProceduresByCategory(category as never) });
  }

  const proceduresSearch = getSearchParam(request, "procedures");
  if (proceduresSearch) {
    return NextResponse.json({ procedures: searchProcedures(proceduresSearch) });
  }

  return NextResponse.json({
    items: faqItems,
    categories: [...new Set(faqItems.map((f) => f.category))],
  });
});
