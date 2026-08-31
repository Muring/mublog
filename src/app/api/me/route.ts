import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

// 사용자별 응답이므로 절대 캐시하지 않는다
export const dynamic = "force-dynamic";

/** 현재 로그인 상태. 사이드 메뉴와 댓글 영역이 사용한다. */
export async function GET() {
    try {
        const profile = await getProfile();

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
