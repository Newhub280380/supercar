import { NextRequest, NextResponse } from "next/server";
import { utmCampaignsData } from "@/lib/promotion-mock-data";

export async function GET(_request: NextRequest) {
  return NextResponse.json({ campaigns: utmCampaignsData });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const generatedUrl = `${baseUrl}${body.landingUrl}?utm_source=${body.source}&utm_medium=${body.medium}&utm_campaign=${body.campaign}${body.term ? `&utm_term=${body.term}` : ""}${body.content ? `&utm_content=${body.content}` : ""}`;
  const newCampaign = {
    id: `utm-${Date.now()}`,
    ...body,
    generatedUrl,
    clickCount: 0,
    conversionCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
  return NextResponse.json({ campaign: newCampaign }, { status: 201 });
}
