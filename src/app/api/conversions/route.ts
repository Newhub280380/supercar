import { NextResponse } from "next/server";
import { conversionGoalsData, abTestsData } from "@/lib/promotion-mock-data";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";

export const GET = withRole("List conversions error", MANAGER_ROLES, async () =>
  NextResponse.json({
    goals: conversionGoalsData,
    abTests: abTestsData,
  }),
);
