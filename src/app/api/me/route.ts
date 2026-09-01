import { NextResponse } from "next/server";
import { getDisplayProfile } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

// 사용자별 응답이므로 절대 캐시하지 않는다
export const dynamic = "force-dynamic";

/**
 * 현재 로그인 상태. 헤더 / 사이드 메뉴 / 댓글 영역이 사용한다.
 *
 * 인가가 아니라 화면 표시가 목적이라 getDisplayProfile() 을 쓴다.
 * getProfile() 은 Auth 서버 왕복이 하나 더 붙는데, 서버리스에서는 그 왕복이
 * 콜드 스타트와 겹쳐 헤더가 늦게 뜨는 원인이었다.
 */
export async function GET() {
    try {
        const profile = await getDisplayProfile();

        if (!profile) {
            return NextResponse.json({ user: null, isAdmin: false });
        }

        return NextResponse.json({
            user: {
                id: profile.id,
                username: profile.username,
                avatarUrl: profile.avatarUrl,
            },
            isAdmin: profile.role === "ADMIN",
        });
    } catch (error) {
        return handleApiError(error, "api/me");
    }
}
