import { NextRequest, NextResponse } from "next/server";
import { smsCampaignsData } from "@/lib/promotion-mock-data";
import { requireRole } from "@/lib/auth";

const ALLOWED_ROLES = ["cosmetologist", "admin"];

export async function GET() {
  const { response } = await requireRole(ALLOWED_ROLES);
  if (response) return response;

  return NextResponse.json({ campaigns: smsCampaignsData });
}

export async function POST(request: NextRequest) {
  const { response } = await requireRole(ALLOWED_ROLES);
  if (response) return response;

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
