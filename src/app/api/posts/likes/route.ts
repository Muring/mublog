import { NextResponse } from "next/server";
import { getPostLikeCounts } from "@/lib/likes";
import { handleApiError } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
    try {
        return NextResponse.json(await getPostLikeCounts(), { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        return handleApiError(error, "post like counts", "좋아요를 불러오지 못했습니다.");
    }
}
