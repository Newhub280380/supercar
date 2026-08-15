import { NextResponse } from "next/server";
import { conversionGoalsData, abTestsData } from "@/lib/promotion-mock-data";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const { response } = await requireRole(["cosmetologist", "admin"]);
  if (response) return response;

  return NextResponse.json({
    goals: conversionGoalsData,
    abTests: abTestsData,
  });
}
