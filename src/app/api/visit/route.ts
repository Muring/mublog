import { NextResponse, type NextRequest } from "next/server";
import { seoulDateKey } from "@/lib/date";
import {
    POST_VIEW_COOKIE_PREFIX,
    POST_VIEW_WINDOW_MS,
    VISIT_COOKIE,
    getSiteStats,
    isBot,
    recordPostView,
    recordVisit,
    secondsUntilSeoulMidnight,
} from "@/lib/stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 방문 집계 비콘.
 *
 * 렌더 경로 밖에서 클라이언트가 호출한다. 프록시(미들웨어)에서 처리하지 않는 이유:
 * Edge 런타임에서는 Prisma 가 Postgres 에 닿지 못하고, 캐시된 요청을 포함한
 * 모든 요청의 TTFB 에 DB 지연이 붙는다.
 *
 * 실패해도 조용히 넘어간다. 통계 때문에 사용자 경험이 나빠질 이유가 없다.
 */
async function readPostViews(slug: string): Promise<number | null> {
    const { prisma } = await import("@/lib/prisma");
    const post = await prisma.post.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: { viewCount: true },
    });
    return post?.viewCount ?? null;
}

/** 본문에서 slug 를 읽는다. 형식이 어긋나면 무시한다. */
async function readSlug(request: NextRequest): Promise<string | null> {
    try {
        const body = await request.json();
        const slug = body?.slug;
        return typeof slug === "string" && /^[a-z0-9-]{1,120}$/.test(slug) ? slug : null;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        if (isBot(request.headers.get("user-agent"))) {
            return NextResponse.json({ views: null, stats: null });
        }

        const todayKey = seoulDateKey();
        const seen = request.cookies.get(VISIT_COOKIE)?.value;

        // 집계를 먼저 읽어 판단에 쓰고, 갱신 후 값은 직접 더해 만든다.
        // 이렇게 하면 기록 후 다시 조회하지 않아도 된다.
        const before = await getSiteStats();

        // 쿠키에 오늘 날짜가 찍혀 있으면 이미 센 방문자다.
        //
        // 다만 오늘 집계가 0이면 아무도 세어진 적이 없다는 뜻이므로,
        // 그 쿠키는 더 이상 유효하지 않다고 보고 다시 센다.
        // (집계를 초기화했는데 브라우저에는 쿠키가 남아 영영 오르지 않는 상태를 막는다)
        const isNewVisitorToday = seen !== todayKey || before.today === 0;

        if (isNewVisitorToday) await recordVisit(todayKey);

        // 포스트 페이지면 그 글의 조회수도 올린다.
        //
        // 새로고침으로 부풀지 않도록 slug 별 쿠키에 마지막으로 센 시각을 적어두고,
        // 그로부터 POST_VIEW_WINDOW_MS 가 지나야 다시 센다.
        // 방문자 집계와 달리 날짜가 아니라 시각을 쓴다.
        const slug = await readSlug(request);
        const postCookie = slug ? `${POST_VIEW_COOKIE_PREFIX}${slug}` : null;
        const lastViewedAt = postCookie
            ? Number(request.cookies.get(postCookie)?.value ?? 0)
            : 0;
        const now = Date.now();
        const shouldCountView =
            Boolean(slug) &&
            (!Number.isFinite(lastViewedAt) || now - lastViewedAt >= POST_VIEW_WINDOW_MS);

        if (slug && shouldCountView) {
            await recordPostView(slug);
        }

        // 갱신된 수치를 함께 돌려준다.
        // 페이지는 ISR 로 캐시돼 있어 빌드 시점 값이 박혀 있으므로,
        // 클라이언트가 이 값으로 화면을 맞춘다. 별도 요청이 필요 없다.
        const views = slug ? await readPostViews(slug) : null;
        const stats = {
            today: before.today + (isNewVisitorToday ? 1 : 0),
            total: before.total + (isNewVisitorToday ? 1 : 0),
        };

        const response = NextResponse.json({ views, stats });
        if (slug && shouldCountView) {
            response.cookies.set(postCookie!, String(now), {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: Math.ceil(POST_VIEW_WINDOW_MS / 1000),
            });
        }
        if (isNewVisitorToday) {
            response.cookies.set(VISIT_COOKIE, todayKey, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: secondsUntilSeoulMidnight(),
            });
        }
        return response;
    } catch (error) {
        console.error("[api/visit]", error);
        return NextResponse.json({ views: null, stats: null });
    }
}
