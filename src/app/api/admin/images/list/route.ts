import { NextResponse, type NextRequest } from "next/server";
import { HttpError, requireAdminApi } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { getImagePage, getScheduledImageTargets, ImageQueryError, parseImageQuery } from "@/lib/admin-images";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();
        const query = parseImageQuery(request.nextUrl.searchParams);
        const result = request.nextUrl.searchParams.get("targets") === "scheduled"
            ? { targets: await getScheduledImageTargets(query) }
            : await getImagePage(query, request.nextUrl.searchParams.get("cursor") ?? undefined);
        return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        return handleApiError(error instanceof ImageQueryError ? new HttpError(400, error.message) : error,
            "api/admin/images/list", "이미지 목록을 불러오지 못했습니다.");
    }
}
