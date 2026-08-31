import { NextResponse } from "next/server";
import { getSiteStats } from "@/lib/stats";

// 방문자 수는 즉시 반영돼야 하므로 캐시하지 않는다
export const dynamic = "force-dynamic";

/** 사이트 전체 방문 통계 (오늘 / 누적) */
export async function GET() {
    try {
        return NextResponse.json(await getSiteStats());
    } catch (error) {
        console.error("[api/stats]", error);
        return NextResponse.json({ error: "통계를 불러오지 못했습니다." }, { status: 500 });
    }
}
