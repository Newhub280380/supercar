import { NextResponse, type NextRequest } from "next/server";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { notFound, withErrorHandling } from "@/lib/api/response";
import { getSalonClient } from "@/lib/crm/clients-view";

export const GET = withErrorHandling(
  "Ошибка загрузки клиента",
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { session, response } = await requireRole(MANAGER_ROLES);
    if (response) return response;
    const { id } = await params;
    const result = await getSalonClient(session.sub, id);
    if (!result) return notFound("Клиент не найден");
    return NextResponse.json(result);
  },
);
