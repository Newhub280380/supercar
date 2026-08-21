import { NextRequest, NextResponse } from "next/server";
import { smsCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";
import { newDraftCampaign } from "@/lib/campaigns";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";

export const GET = withRole(
  "List SMS campaigns error",
  MANAGER_ROLES,
  async () => NextResponse.json({ campaigns: smsCampaignsData }),
);

export const POST = withRole(
  "Create SMS campaign error",
  MANAGER_ROLES,
  async (_session, request: NextRequest) => {
    const { data: body, error } = await parseJsonBody(request);
    if (error) return error;

    return NextResponse.json(
      { campaign: newDraftCampaign("sms", body) },
      { status: 201 },
    );
  },
);
