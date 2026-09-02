import { NextResponse } from "next/server";
import { getSiteStats } from "@/lib/stats";
import { handleApiError } from "@/lib/api";

// force-dynamic 을 쓰면 Next 가 응답의 Cache-Control 을 지워버려 CDN 이 관여하지 못한다.
// 이 핸들러는 쿠키도 헤더도 읽지 않으므로 그냥 60초 재검증 라우트로 둔다.
export const revalidate = 60;

/**
 * 사이트 전체 방문 통계 (오늘 / 누적)
 *
 * 60초 캐시한다. 서버리스에서는 이 한 번의 호출에도 콜드 스타트와 DB 연결이 붙어
 * 프로덕션에서 1초 가까이 걸렸다. 캐시가 답하면 함수가 아예 깨어나지 않는다.
 *
 * 방문자 본인의 숫자가 늦어지지는 않는다. /api/visit 이 응답에 갱신값을 실어
 * 보내 클라이언트 캐시를 직접 채우기 때문이다. 여기서 오는 값은 그 전에 잠깐
 * 보이는 밑그림이라 60초 지난 값이어도 무방하다.
 */
export async function GET() {
    try {
        return NextResponse.json(await getSiteStats());
    } catch (error) {
        return handleApiError(error, "api/stats", "통계를 불러오지 못했습니다.");
    }
}
