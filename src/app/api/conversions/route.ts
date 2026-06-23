import { NextRequest, NextResponse } from "next/server";
import { conversionGoalsData, abTestsData } from "@/lib/promotion-mock-data";

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    goals: conversionGoalsData,
    abTests: abTestsData,
  });
}
