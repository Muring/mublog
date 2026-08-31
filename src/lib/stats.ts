import { prisma } from "@/lib/prisma";
import { seoulDateKey } from "@/lib/date";

export const VISIT_COOKIE = "mublog_seen";
/** 포스트별 중복 집계를 막는 쿠키 접두사 */
export const POST_VIEW_COOKIE_PREFIX = "mublog_p_";

/**
 * 같은 사람의 재조회를 한 번으로 묶는 시간.
 *
 * 새로고침이나 뒤로가기로 수치가 부풀지 않게 하되, 하루를 통째로 막으면
 * "조회수"라기보다 순 방문자에 가까워진다. 30분이 둘 사이의 절충이다.
 */
export const POST_VIEW_WINDOW_MS = 30 * 60 * 1000;

export type SiteStats = {
    /** 오늘(KST) 순 방문자 */
    today: number;
    /** 개설 이후 누적 방문자 (일별 순 방문자의 합) */
    total: number;
};

/**
 * 오늘자 순 방문자를 1 올린다.
 *
 * 요청마다 행을 남기지 않는다. KST 하루당 한 행만 유지하므로 연 365행,
 * 약 20KB 에 그친다. 500MB 무료 한도를 갉아먹을 여지를 처음부터 없앤다.
 *
 * 이미 센 방문자면 아무것도 쓰지 않는다. 같은 사람의 페이지 이동마다
 * DB 를 건드릴 이유가 없다.
 *
 * upsert 대신 raw SQL 을 쓰는 이유는 이것이 레이스 없는 단일 문장임이
 * 보장되기 때문이다. 조회 후 갱신하는 형태면 동시 요청에서 카운트가 어긋난다.
 */
export async function recordVisit(dateKey: string): Promise<void> {
    await prisma.$executeRaw`
        INSERT INTO daily_stats (date, visitors)
        VALUES (${dateKey}::date, 1)
        ON CONFLICT (date) DO UPDATE
            SET visitors = daily_stats.visitors + 1
    `;
}

/**
 * 포스트 조회수를 1 올린다.
 *
 * 사이트 방문 집계와 달리 날짜별로 쌓지 않고 포스트 행의 누적값만 올린다.
 * post_views 같은 별도 테이블을 두면 25개 x 365일로 연 9천 행이 쌓이는데,
 * 지금 필요한 것은 "이 글이 몇 번 읽혔나" 하나뿐이라 그만한 값을 하지 않는다.
 */
export async function recordPostView(slug: string): Promise<void> {
    await prisma.post.updateMany({
        where: { slug, status: "PUBLISHED" },
        data: { viewCount: { increment: 1 } },
    });
}

/**
 * 사이트 전체 방문 통계.
 *
 * 총 방문자는 일별 순 방문자의 합이다. 별도 누적 테이블을 두지 않는다.
 *
 * 캐시하지 않는다. 방문자 수는 올라간 것이 바로 보여야 의미가 있고,
 * 오늘 행 조회 + 365행 남짓의 합계라 매번 실행해도 부담이 없다.
 */
export async function getSiteStats(): Promise<SiteStats> {
    const todayKey = seoulDateKey();

    const [todayRow, aggregate] = await Promise.all([
        // @db.Date 는 시각 없이 달력 날짜만 담는다. Prisma 는 이를 UTC 자정으로
        // 주고받고, recordVisit 의 `::date` 캐스팅도 같은 달력 날짜를 쓰므로 일치한다.
        prisma.dailyStat.findUnique({ where: { date: new Date(todayKey) } }),
        prisma.dailyStat.aggregate({ _sum: { visitors: true } }),
    ]);

    return {
        today: todayRow?.visitors ?? 0,
        total: aggregate._sum.visitors ?? 0,
    };
}

/** 다음 KST 자정까지 남은 초. 방문 쿠키의 수명으로 쓴다. */
export function secondsUntilSeoulMidnight(now: Date = new Date()): number {
    // KST 는 UTC+9 로 고정이라 서머타임을 고려할 필요가 없다
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    const kstNow = now.getTime() + KST_OFFSET_MS;
    const msIntoDay = kstNow % 86_400_000;
    return Math.ceil((86_400_000 - msIntoDay) / 1000);
}

/** 검색엔진과 각종 봇은 집계에서 제외한다 */
const BOT_PATTERN =
    /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vercel|lighthouse|headless|monitor|preview|fetch|curl|wget|python-requests|axios|node-fetch/i;

export function isBot(userAgent: string | null): boolean {
    if (!userAgent) return true; // UA 가 없는 요청은 사람으로 보지 않는다
    return BOT_PATTERN.test(userAgent);
}
