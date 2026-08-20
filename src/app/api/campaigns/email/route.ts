import { NextRequest, NextResponse } from "next/server";
import { emailCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";
import { newDraftCampaign } from "@/lib/campaigns";

export async function GET() {
  return NextResponse.json({ campaigns: emailCampaignsData });
}

export async function POST(request: NextRequest) {
  const { data: body, error } = await parseJsonBody(request);
  if (error) return error;

  return NextResponse.json(
    { campaign: newDraftCampaign("ec", body) },
    { status: 201 },
  );
}
