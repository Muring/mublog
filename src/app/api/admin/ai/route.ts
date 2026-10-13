import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError, PRIVATE_NO_STORE } from "@/lib/api";
import { getAdminAi } from "@/lib/ai-usage-data";
export const dynamic = "force-dynamic";
export async function GET() {
    try { await requireAdminApi(); return NextResponse.json(await getAdminAi(), { headers: PRIVATE_NO_STORE }); }
    catch (error) { return handleApiError(error, "admin-ai"); }
}
