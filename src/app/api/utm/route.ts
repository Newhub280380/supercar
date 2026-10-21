import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { utmCampaigns } from "@/db/schema";
import { parseJsonBody } from "@/lib/api-utils";
import { withRole } from "@/lib/api/handlers";
import { badRequest } from "@/lib/api/response";
import { MANAGER_ROLES } from "@/lib/auth";
import { getPublicBaseUrl } from "@/lib/env";
import { toLocalIsoDate } from "@/lib/format";

const REQUIRED_FIELDS = ["landingUrl", "source", "medium", "campaign"] as const;

function isRelativePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function generatedUrl(row: {
  landingUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string | null;
  content: string | null;
}): string {
  const params = new URLSearchParams({
    utm_source: row.source,
    utm_medium: row.medium,
    utm_campaign: row.campaign,
    ...(row.term ? { utm_term: row.term } : {}),
    ...(row.content ? { utm_content: row.content } : {}),
  });
  return `${getPublicBaseUrl()}${row.landingUrl}?${params.toString()}`;
}

function toItem(row: typeof utmCampaigns.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    landingUrl: row.landingUrl,
    generatedUrl: generatedUrl(row),
    clickCount: row.clickCount,
    conversionCount: row.conversionCount,
    createdAt: toLocalIsoDate(row.createdAt),
  };
}

export const GET = withRole(
  "List UTM campaigns error",
  MANAGER_ROLES,
  async (session) => {
    const rows = await db
      .select()
      .from(utmCampaigns)
      .where(eq(utmCampaigns.userId, session.sub))
      .orderBy(desc(utmCampaigns.createdAt));
    return NextResponse.json({ campaigns: rows.map(toItem) });
  },
);

export const POST = withRole(
  "Create UTM campaign error",
  MANAGER_ROLES,
  async (session, request: NextRequest) => {
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

    const source = String(body.source).slice(0, 120);
    const medium = String(body.medium).slice(0, 120);
    const campaign = String(body.campaign).slice(0, 200);
    const term = optionalString(body.term);
    const content = optionalString(body.content);

    const [row] = await db
      .insert(utmCampaigns)
      .values({
        userId: session.sub,
        name: campaign,
        source,
        medium,
        campaign,
        term,
        content,
        landingUrl,
      })
      .returning();

    return NextResponse.json({ campaign: toItem(row) }, { status: 201 });
  },
);
