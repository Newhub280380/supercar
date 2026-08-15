import { NextRequest, NextResponse } from "next/server";
import { utmCampaignsData } from "@/lib/promotion-mock-data";
import { getPublicBaseUrl } from "@/lib/env";
import { toIsoDate } from "@/lib/format";

export async function GET() {
  return NextResponse.json({ campaigns: utmCampaignsData });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const baseUrl = getPublicBaseUrl();
  const generatedUrl = `${baseUrl}${body.landingUrl}?utm_source=${body.source}&utm_medium=${body.medium}&utm_campaign=${body.campaign}${body.term ? `&utm_term=${body.term}` : ""}${body.content ? `&utm_content=${body.content}` : ""}`;
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
