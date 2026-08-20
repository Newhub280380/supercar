import { toIsoDate } from "./format";

/** Draft campaign record shared by the email and SMS campaign endpoints. */
export function newDraftCampaign(
  idPrefix: string,
  body: Record<string, unknown>,
) {
  return {
    id: `${idPrefix}-${Date.now()}`,
    ...body,
    status: "draft",
    recipientCount:
      typeof body.recipientCount === "number" ? body.recipientCount : 0,
    sentAt: null,
    metrics: null,
    createdAt: toIsoDate(),
  };
}
