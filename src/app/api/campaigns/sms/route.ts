import { NextRequest, NextResponse } from "next/server";
import { smsCampaignsData } from "@/lib/promotion-mock-data";
import { newDraftCampaign } from "@/lib/campaigns";

export async function GET() {
  return NextResponse.json({ campaigns: smsCampaignsData });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ campaign: newDraftCampaign("sms", body) }, { status: 201 });
}
