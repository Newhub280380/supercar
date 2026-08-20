import { NextRequest, NextResponse } from "next/server";
import { smsCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";
import { newDraftCampaign } from "@/lib/campaigns";

export async function GET() {
  return NextResponse.json({ campaigns: smsCampaignsData });
}

export async function POST(request: NextRequest) {
  const { data: body, error } = await parseJsonBody(request);
  if (error) return error;

  return NextResponse.json(
    { campaign: newDraftCampaign("sms", body) },
    { status: 201 },
  );
}
