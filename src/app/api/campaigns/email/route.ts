import { NextRequest, NextResponse } from "next/server";
import { emailCampaignsData } from "@/lib/promotion-mock-data";
import { newDraftCampaign } from "@/lib/campaigns";

export async function GET() {
  return NextResponse.json({ campaigns: emailCampaignsData });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ campaign: newDraftCampaign("ec", body) }, { status: 201 });
}
