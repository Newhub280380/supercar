import { NextRequest, NextResponse } from "next/server";
import { utmCampaignsData } from "@/lib/promotion-mock-data";
import { parseJsonBody } from "@/lib/api-utils";
import { getPublicBaseUrl } from "@/lib/env";
import { toIsoDate } from "@/lib/format";

const REQUIRED_FIELDS = ["landingUrl", "source", "medium", "campaign"] as const;

export async function GET() {
  return NextResponse.json({ campaigns: utmCampaignsData });
}

export async function POST(request: NextRequest) {
  const { data: body, error } = await parseJsonBody(request);
  if (error) return error;

  const missing = REQUIRED_FIELDS.filter(
    (field) => typeof body[field] !== "string" || !body[field],
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    utm_source: String(body.source),
    utm_medium: String(body.medium),
    utm_campaign: String(body.campaign),
    ...(typeof body.term === "string" && body.term
      ? { utm_term: body.term }
      : {}),
    ...(typeof body.content === "string" && body.content
      ? { utm_content: body.content }
      : {}),
  });

  const generatedUrl = `${getPublicBaseUrl()}${String(body.landingUrl)}?${params.toString()}`;
  const newCampaign = {
    id: `utm-${Date.now()}`,
    ...body,
    generatedUrl,
    clickCount: 0,
    conversionCount: 0,
    createdAt: toIsoDate(),
  };
  return NextResponse.json({ campaign: newCampaign }, { status: 201 });
}
