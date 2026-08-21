import { NextRequest, NextResponse } from "next/server";
import { emailCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";
import { newDraftCampaign } from "@/lib/campaigns";
import { withRole } from "@/lib/api/handlers";
import { MANAGER_ROLES } from "@/lib/auth";

export const GET = withRole(
  "List email campaigns error",
  MANAGER_ROLES,
  async () => NextResponse.json({ campaigns: emailCampaignsData }),
);

export const POST = withRole(
  "Create email campaign error",
  MANAGER_ROLES,
  async (_session, request: NextRequest) => {
    const { data: body, error } = await parseJsonBody(request);
    if (error) return error;

    return NextResponse.json(
      { campaign: newDraftCampaign("ec", body) },
      { status: 201 },
    );
  },
);
