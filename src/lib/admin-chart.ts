export type ChartPoint = { date: string; value: number | null };
export type BucketKey = "daily" | "weekly" | "monthly";
export const BUCKETS = [
    { key: "daily", label: "일별 · 최근 30일" },
    { key: "weekly", label: "주별 · 최근 12주" },
    { key: "monthly", label: "월별" },
] as const;
const offset = (date: string, days: number) => new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);
function monday(date: string) {
    return offset(date, -((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7));
}
/** Fixed calendar slots shared by both metrics. Missing observations stay null. */
export function bucketPoints(points: ChartPoint[], bucket: BucketKey, year: string, today: string) {
    const sums = new Map<string, number>();
    for (const point of points) {
        if (point.value === null || point.date > today) continue;
        const key = bucket === "monthly" ? point.date.slice(0, 7) : bucket === "weekly" ? monday(point.date) : point.date;
        sums.set(key, (sums.get(key) ?? 0) + point.value);
    }
    const keys = bucket === "monthly" ? Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`)
        : bucket === "weekly" ? Array.from({ length: 12 }, (_, i) => offset(monday(today), (i - 11) * 7))
        : Array.from({ length: 30 }, (_, i) => offset(today, i - 29));
    return keys.map((key) => ({
        key,
        label: bucket === "monthly" ? `${Number(key.slice(5, 7))}월` : `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`,
        period: bucket === "weekly" ? `${key} ~ ${offset(key, 6)}` : key,
        value: sums.get(key) ?? null,
    }));
}
export function niceCeil(value: number) {
    if (value <= 4) return 4;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    return [1, 2, 4, 5, 10].map((step) => step * magnitude).find((ceiling) => ceiling >= value)!;
}
export function lineSegments(values: (number | null)[], ceiling: number) {
    const segments: string[] = [];
    let current: string[] = [];
    values.forEach((value, index) => {
        if (value === null) {
            if (current.length) segments.push(current.join(" "));
            current = [];
        } else {
            const x = values.length === 1 ? 50 : index / (values.length - 1) * 100;
            const y = 100 - value / ceiling * 100;
            current.push(`${current.length ? "L" : "M"}${x},${y}`);
            // Include a short segment for an isolated observation.
            current.push(`L${x + 0.15},${y}`);
        }
    });
    if (current.length) segments.push(current.join(" "));
    return segments;
}
