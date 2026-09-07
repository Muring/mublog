import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { listImageLibrary } from "@/lib/storage";

export const dynamic = "force-dynamic";
// 정적 썸네일을 읽으려면 파일 시스템이 필요하다
export const runtime = "nodejs";

/**
 * 고를 수 있는 이미지 목록 (관리자 전용).
 *
 * 캐시하지 않는다. 방금 올린 이미지가 목록에 없으면 그 화면의 쓸모가 없다.
 * 개수가 수백 장이 되면 그때 페이지를 나눈다 — 지금은 스무 장 남짓이다.
 */
export async function GET() {
    try {
        await requireAdminApi();
        return NextResponse.json({ images: await listImageLibrary() });
    } catch (error) {
        return handleApiError(error, "api/admin/images", "이미지 목록을 불러오지 못했습니다.");
    }
}
