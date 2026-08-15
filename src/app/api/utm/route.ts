import { NextRequest, NextResponse } from "next/server";
import { utmCampaignsData } from "@/lib/promotion-mock-data";
import { requireRole } from "@/lib/auth";

const ALLOWED_ROLES = ["cosmetologist", "admin"];

export async function GET() {
  const { response } = await requireRole(ALLOWED_ROLES);
  if (response) return response;

  return NextResponse.json({ campaigns: utmCampaignsData });
}

export async function POST(request: NextRequest) {
  const { response } = await requireRole(ALLOWED_ROLES);
  if (response) return response;

  const body = await request.json();
  const { landingUrl, source, medium, campaign, term, content } = body as Record<
    string,
    unknown
  >;

  if (typeof landingUrl !== "string" || !isRelativePath(landingUrl)) {
    return NextResponse.json(
      { error: "landingUrl must be a relative path starting with /" },
      { status: 400 },
    );
  }

  if (
    typeof source !== "string" ||
    typeof medium !== "string" ||
    typeof campaign !== "string" ||
    !source.trim() ||
    !medium.trim() ||
    !campaign.trim()
  ) {
    return NextResponse.json(
      { error: "source, medium and campaign are required" },
      { status: 400 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
  });
  if (typeof term === "string" && term) params.set("utm_term", term);
  if (typeof content === "string" && content) params.set("utm_content", content);

  const generatedUrl = `${baseUrl}${landingUrl}?${params.toString()}`;

  const newCampaign = {
    id: `utm-${Date.now()}`,
    landingUrl,
    source,
    medium,
    campaign,
    term: typeof term === "string" ? term : null,
    content: typeof content === "string" ? content : null,
    generatedUrl,
    clickCount: 0,
    conversionCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
  return NextResponse.json({ campaign: newCampaign }, { status: 201 });
}

function isRelativePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}
