import { NextRequest, NextResponse } from "next/server";
import { smsCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";

export async function GET(_request: NextRequest) {
  return NextResponse.json({ campaigns: smsCampaignsData });
}

export async function POST(request: NextRequest) {
  const { data: body, error } = await parseJsonBody(request);
  if (error) return error;

  const newCampaign = {
    id: `sms-${Date.now()}`,
    ...body,
    status: "draft",
    recipientCount:
      typeof body.recipientCount === "number" ? body.recipientCount : 0,
    sentAt: null,
    metrics: null,
    createdAt: new Date().toISOString().split("T")[0],
  };
  return NextResponse.json({ campaign: newCampaign }, { status: 201 });
}
