import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi, HttpError } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { seoulDateKey } from "@/lib/date";
import { analyticsRange, analyticsDateError } from "@/lib/admin-analytics";
import { getAdminAnalytics } from "@/lib/admin-analytics-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();
        const today = seoulDateKey();
        const params = request.nextUrl.searchParams;
        const error = params.get("period") === "custom" ? analyticsDateError(params.get("from"), params.get("to"), today) : null;
        if (error) throw new HttpError(400, error);
        const data = await getAdminAnalytics(analyticsRange(request.nextUrl.searchParams, today), today);
        return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        return handleApiError(error, "api/admin/stats", "통계를 불러오지 못했습니다.");
    }
}
