import { NextRequest, NextResponse } from "next/server";
import { utmCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";
import { withRole } from "@/lib/api/handlers";
import { badRequest } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import { getPublicBaseUrl } from "@/lib/env";
import { toIsoDate } from "@/lib/format";

const REQUIRED_FIELDS = ["landingUrl", "source", "medium", "campaign"] as const;

function isRelativePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

export const GET = withRole(
  "List UTM campaigns error",
  MANAGER_ROLES,
  async () => NextResponse.json({ campaigns: utmCampaignsData }),
);

export const POST = withRole(
  "Create UTM campaign error",
  MANAGER_ROLES,
  async (_session, request: NextRequest) => {
    const { data: body, error } = await parseJsonBody(request);
    if (error) return error;

    const missing = REQUIRED_FIELDS.filter(
      (field) => typeof body[field] !== "string" || !body[field],
    );
    if (missing.length > 0) {
      return badRequest(`Missing required fields: ${missing.join(", ")}`);
    }

    const landingUrl = String(body.landingUrl);
    if (!isRelativePath(landingUrl)) {
      return badRequest("landingUrl must be a relative path starting with /");
    }

    const term = optionalString(body.term);
    const content = optionalString(body.content);

    const params = new URLSearchParams({
      utm_source: String(body.source),
      utm_medium: String(body.medium),
      utm_campaign: String(body.campaign),
      ...(term ? { utm_term: term } : {}),
      ...(content ? { utm_content: content } : {}),
    });

    const campaign = {
      id: `utm-${Date.now()}`,
      landingUrl,
      source: String(body.source),
      medium: String(body.medium),
      campaign: String(body.campaign),
      term,
      content,
      generatedUrl: `${getPublicBaseUrl()}${landingUrl}?${params.toString()}`,
      clickCount: 0,
      conversionCount: 0,
      createdAt: toIsoDate(),
    };

    return NextResponse.json({ campaign }, { status: 201 });
  },
);
