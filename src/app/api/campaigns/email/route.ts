import { NextRequest, NextResponse } from "next/server";
import { emailCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth";

const ALLOWED_ROLES = ["cosmetologist", "admin"];

export async function GET() {
  const { response } = await requireRole(ALLOWED_ROLES);
  if (response) return response;

  return NextResponse.json({ campaigns: emailCampaignsData });
}

export async function POST(request: NextRequest) {
  const { response } = await requireRole(ALLOWED_ROLES);
  if (response) return response;

  const { data: body, error } = await parseJsonBody(request);
  if (error) return error;

  const newCampaign = {
    id: `ec-${Date.now()}`,
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
