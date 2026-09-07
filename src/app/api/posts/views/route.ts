import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

// 조회수는 계속 바뀌므로 캐시하지 않는다.
// 목록 페이지 자체는 ISR 로 두고 이 숫자만 클라이언트가 따로 가져간다.
export const dynamic = "force-dynamic";

/**
 * 발행 포스트의 조회수 전부.
 *
 * 카드 하나마다 /api/posts/<slug>/views 를 부르면 홈에서만 스무 번이 넘는다.
 * 한 번에 받아 카드들이 나눠 쓴다 — 모두 같은 쿼리 키를 쓰므로 요청은 한 번이다.
 *
 * 응답이 slug 배열이 아니라 map 인 이유는 카드가 자기 것만 꺼내 쓰기 때문이다.
 * 스물여덟 줄이라 통째로 내려도 1KB 남짓이다.
 */
export async function GET() {
    try {
        const rows = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            select: { slug: true, viewCount: true },
        });

        return NextResponse.json(Object.fromEntries(rows.map((r) => [r.slug, r.viewCount])));
    } catch (error) {
        return handleApiError(error, "api/posts/views", "조회수를 불러오지 못했습니다.");
    }
}
