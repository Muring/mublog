import { commentDate } from "./admin-navigation";
import type { BucketKey } from "./admin-chart";

export type AnalyticsRange = { from: string; to: string; previousFrom: string; previousTo: string; days: number; preset: string; bucket: BucketKey };
export type MetricPoint = { date: string; value: number };
export type PostPerformance = { id: string; slug: string; title: string; status: string; tags: string[]; views: number; previous: number; activeDays: number };
export type AnalyticsData = {
    range: AnalyticsRange; today: string;
    visits: MetricPoint[]; views: MetricPoint[];
    visitsSince: string | null; viewsSince: string | null;
    posts: PostPerformance[];
};
export const dayOffset = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
export const dayCount = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;

/** 폼과 API에서 같은 날짜 규칙을 적용한다. 잘못된 순서를 자동 교환하지 않는다. */
export function analyticsDateError(from: string | null, to: string | null, today: string): string | null {
    if (!commentDate(from) || !commentDate(to)) return "시작일과 종료일을 올바르게 입력해 주세요.";
    if (from! < "1970-01-01" || to! < "1970-01-01") return "1970년 1월 1일 이후 날짜를 선택해 주세요.";
    if (from! > to!) return "종료일은 시작일보다 빠를 수 없습니다.";
    if (to! > today) return "오늘 이후 날짜는 선택할 수 없습니다.";
    return null;
}

export function analyticsRange(params: URLSearchParams, today: string): AnalyticsRange {
    const bucket = params.get("unit");
    const preset = params.get("period");
    let to = today;
    let from = dayOffset(today, -29);
    let selected = "30";
    if (preset === "custom") {
        const a = params.get("from"), b = params.get("to");
        if (!analyticsDateError(a, b, today)) {
            from = a!;
            to = b!;
            selected = "custom";
        }
    } else if (preset === "7" || preset === "30" || preset === "90") {
        from = dayOffset(today, 1 - Number(preset));
        selected = preset;
    }
    const days = dayCount(from, to);
    return { from, to, days, previousFrom: dayOffset(from, -days), previousTo: dayOffset(from, -1), preset: selected, bucket: bucket === "weekly" || bucket === "monthly" ? bucket : "daily" };
}

export function analyticsUrl(range: Pick<AnalyticsRange, "preset" | "from" | "to" | "bucket">, returnTo?: string) {
    const params = new URLSearchParams({ period: range.preset, unit: range.bucket });
    if (range.preset === "custom") { params.set("from", range.from); params.set("to", range.to); }
    if (returnTo && returnTo !== "/admin") params.set("returnTo", returnTo);
    return `/admin/stats?${params}`;
}

/** 서버 요청은 기간만 구분한다. 일·주·월과 정렬은 같은 일별 원본을 재사용한다. */
export function analyticsDataKey(range: Pick<AnalyticsRange, "from" | "to">, today: string) {
    return ["admin-analytics", today, range.from, range.to] as const;
}
export function analyticsDataUrl(range: Pick<AnalyticsRange, "from" | "to">) {
    return `/api/admin/stats?${new URLSearchParams({ period: "custom", from: range.from, to: range.to })}`;
}

export function metricSummary(points: MetricPoint[], since: string | null, range: AnalyticsRange, today: string) {
    const sum = (from: string, to: string) => points.reduce((n, p) => n + (p.date >= from && p.date <= to ? p.value : 0), 0);
    return {
        value: since && since <= range.to ? sum(range.from, range.to) : null,
        previous: since && since <= range.previousFrom ? sum(range.previousFrom, range.previousTo) : null,
        today: since && since <= today ? sum(today, today) : null,
        partial: Boolean(since && since > range.from && since <= range.to),
    };
}
export function changeLabel(value: number | null, previous: number | null, unit: string) {
    if (value === null || previous === null) return "비교 기록 부족";
    const diff = value - previous;
    const amount = `${diff > 0 ? "+" : ""}${diff.toLocaleString("ko-KR")}${unit}`;
    return previous === 0 ? amount : `${amount} (${diff > 0 ? "+" : ""}${(diff / previous * 100).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%)`;
}

/** Missing days after the first retained observation are zero; earlier days remain unknown. */
export function rangeBuckets(points: MetricPoint[], since: string | null, range: Pick<AnalyticsRange, "from" | "to" | "bucket">, today: string) {
    const values = new Map(points.map(p => [p.date, p.value]));
    const result: { key: string; from: string; to: string; value: number | null; partial: boolean; ongoing: boolean }[] = [];
    for (let date = range.from; date <= range.to; date = dayOffset(date, 1)) {
        const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
        const key = range.bucket === "monthly" ? date.slice(0, 7) : range.bucket === "weekly" ? dayOffset(date, -((weekday + 6) % 7)) : date;
        let item = result.at(-1);
        if (!item || item.key !== key) {
            item = { key, from: date, to: date, value: null, partial: false, ongoing: false };
            result.push(item);
        }
        item.to = date;
        if (since && date >= since) item.value = (item.value ?? 0) + (values.get(date) ?? 0);
        else item.partial = true;
        if (date === today) item.ongoing = true;
    }
    return result.map(item => {
        const calendarStart = range.bucket === "monthly" ? `${item.key}-01` : item.key;
        const calendarEnd = range.bucket === "weekly" ? dayOffset(item.key, 6) : range.bucket === "monthly"
            ? dayOffset(`${Number(item.key.slice(0, 4)) + (item.key.endsWith("-12") ? 1 : 0)}-${String(Number(item.key.slice(5)) % 12 + 1).padStart(2, "0")}-01`, -1)
            : item.key;
        return { ...item, partial: item.partial || item.from > calendarStart || item.to < calendarEnd };
    });
}

export function weekdayAverages(points: MetricPoint[], since: string | null, range: Pick<AnalyticsRange, "from" | "to">, today: string) {
    const values = new Map(points.map(p => [p.date, p.value]));
    const rows = ["월", "화", "수", "목", "금", "토", "일"].map(label => ({ label, sum: 0, days: 0, average: null as number | null }));
    if (!since) return rows;
    const end = range.to < today ? range.to : dayOffset(today, -1);
    for (let date = range.from > since ? range.from : since; date <= end; date = dayOffset(date, 1)) {
        const row = rows[(new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7];
        row.sum += values.get(date) ?? 0;
        row.days++;
    }
    return rows.map(row => ({ ...row, average: row.days ? row.sum / row.days : null }));
}
export function rankPosts(posts: PostPerformance[], sort: "views" | "growth" | "days") {
    return posts.filter(p => p.views > 0 && (sort !== "growth" || p.views > p.previous)).sort((a, b) =>
        (sort === "growth" ? (b.views - b.previous) - (a.views - a.previous) : sort === "days" ? b.activeDays - a.activeDays : b.views - a.views)
        || b.views - a.views || a.title.localeCompare(b.title, "ko") || a.id.localeCompare(b.id)).slice(0, 10);
}
export function tagPerformance(posts: PostPerformance[]) {
    const tags = new Map<string, number>();
    for (const post of posts) for (const tag of new Set(post.tags)) tags.set(tag, (tags.get(tag) ?? 0) + post.views);
    const total = [...tags.values()].reduce((a, b) => a + b, 0);
    return [...tags].filter(([, views]) => views > 0).map(([tag, views]) => ({ tag, views, share: views / total * 100 }))
        .sort((a, b) => b.views - a.views || a.tag.localeCompare(b.tag, "ko"));
}
export function topPostShare(posts: PostPerformance[]) {
    const top = rankPosts(posts, "views").slice(0, 5);
    const total = posts.reduce((n, p) => n + p.views, 0);
    return { count: top.length, share: total ? top.reduce((n, p) => n + p.views, 0) / total * 100 : null };
}
