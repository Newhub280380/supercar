import { NextRequest, NextResponse } from "next/server";
import { smsCampaignsData } from "@/lib/promotion-mock-data";

export async function GET(_request: NextRequest) {
  return NextResponse.json({ campaigns: smsCampaignsData });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newCampaign = {
    id: `sms-${Date.now()}`,
    ...body,
    status: "draft",
    recipientCount: body.recipientCount || 0,
    sentAt: null,
    metrics: null,
    createdAt: new Date().toISOString().split("T")[0],
  };
  return NextResponse.json({ campaign: newCampaign }, { status: 201 });
}
