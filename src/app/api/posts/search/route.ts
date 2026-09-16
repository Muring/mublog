import { NextResponse, type NextRequest } from "next/server";
import { searchPosts } from "@/lib/posts";
import { handleApiError } from "@/lib/api";
import { clientIp, overLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MIN_LENGTH = 2;
const MAX_LENGTH = 60;
/** 인스턴스마다 따로 센다(lib/rate-limit.ts). 전체 상한이 아니다. */
const LIMIT_PER_MINUTE = 60;

/**
 * GET /api/posts/search?q=…
 *
 * 인증이 없고 DB 를 친다. 검색어 길이와 IP 상한으로만 막는다.
 * 같은 검색어는 CDN 이 5분 들고 있어도 된다 — 새 글이 검색에 5분 늦게 잡히는 건 괜찮다.
 */
export async function GET(request: NextRequest) {
    try {
        const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
        if (q.length < MIN_LENGTH) return NextResponse.json({ query: q, results: [] });
        if (q.length > MAX_LENGTH) {
            return NextResponse.json({ error: `검색어는 ${MAX_LENGTH}자까지입니다.` }, { status: 400 });
        }
        if (overLimit(`search:${clientIp(request)}`, LIMIT_PER_MINUTE, 60_000)) {
            return NextResponse.json({ error: "잠시 후 다시 시도하세요." }, { status: 429 });
        }

        const results = await searchPosts(q);
        return NextResponse.json(
            { query: q, results },
            { headers: { "Cache-Control": "public, max-age=0, s-maxage=300" } }
        );
    } catch (error) {
        return handleApiError(error, "api/posts/search", "검색에 실패했습니다.");
    }
}
