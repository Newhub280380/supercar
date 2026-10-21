import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";

/**
 * Запись лида: либо Bearer LEADS_INGEST_TOKEN (агент/вебхук),
 * либо сессия менеджера. Без токена в окружении ручной CRM всё равно работает.
 */
export async function leadWriteDenied(
  request: NextRequest,
): Promise<NextResponse | null> {
  const token = process.env.LEADS_INGEST_TOKEN;
  if (token && request.headers.get("authorization") === `Bearer ${token}`) {
    return null;
  }
  const { response } = await requireRole(MANAGER_ROLES);
  return response ?? null;
}
