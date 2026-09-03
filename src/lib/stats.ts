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

export type DailyPoint = { date: string; visitors: number };

/**
 * 최근 방문자 추이. 관리 화면의 차트가 쓴다.
 *
 * 집계를 시작하기 전 날짜를 0 으로 채우지 않는다. 그 0 은 "아무도 안 왔다" 가
 * 아니라 "세지 않았다" 라서, 그려두면 없던 사실을 만들어낸다.
 * 그래서 창의 시작은 `요청한 일수 전` 과 `첫 기록일` 중 더 늦은 쪽이다.
 *
 * 그 안쪽의 빈 날은 진짜 0 이므로 채운다. 행이 없다는 건 그날 아무도
 * 오지 않아 recordVisit 이 한 번도 불리지 않았다는 뜻이다.
 */
export async function getDailyVisitors(days = 30): Promise<DailyPoint[]> {
    const rows = await prisma.dailyStat.findMany({
        orderBy: { date: "asc" },
        select: { date: true, visitors: true },
    });
    if (rows.length === 0) return [];

    const key = (d: Date) => d.toISOString().slice(0, 10);
    const byDate = new Map(rows.map((r) => [key(r.date), r.visitors]));

    const today = new Date(`${seoulDateKey()}T00:00:00Z`);
    const windowStart = new Date(today);
    windowStart.setUTCDate(windowStart.getUTCDate() - (days - 1));

    const first = rows[0].date;
    const start = windowStart > first ? windowStart : first;

    const points: DailyPoint[] = [];
    for (const cursor = new Date(start); cursor <= today; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
        const k = key(cursor);
        points.push({ date: k, visitors: byDate.get(k) ?? 0 });
    }
    return points;
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
