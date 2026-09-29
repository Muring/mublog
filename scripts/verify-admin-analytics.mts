import assert from "node:assert/strict";
import { chartMorph } from "../src/lib/chart-morph";
import { analyticsDateError, analyticsRange, analyticsUrl, analyticsDataKey, analyticsDataUrl, changeLabel, metricSummary, rangeBuckets, weekdayAverages, rankPosts, tagPerformance, topPostShare, type PostPerformance } from "../src/lib/admin-analytics";

const range = analyticsRange(new URLSearchParams("period=custom&from=2024-02-27&to=2024-03-04"), "2024-03-04");
assert.equal(range.days, 7);
assert.deepEqual([range.previousFrom, range.previousTo], ["2024-02-20", "2024-02-26"]);
const points = [{ date: "2024-02-27", value: 2 }, { date: "2024-02-29", value: 3 }, { date: "2024-03-04", value: 5 }];
for (const bucket of ["daily", "weekly", "monthly"] as const) {
    const bars = rangeBuckets(points, "2024-02-27", { ...range, bucket }, "2024-03-04");
    assert.equal(bars.reduce((n, p) => n + (p.value ?? 0), 0), 10, `${bucket} preserves period sum`);
    assert.equal(bars.at(-1)?.ongoing, true);
    assert.equal(bars[0].from, range.from);
    assert.equal(bars.at(-1)?.to, range.to);
}
const weekly = rangeBuckets(points, "2024-02-27", { ...range, bucket: "weekly" }, "2024-03-04");
assert.deepEqual(weekly.map(p => [p.key, p.value]), [["2024-02-26", 5], ["2024-03-04", 5]]);
assert.equal(weekly[0].partial, true);
assert.equal(weekly[1].partial, true);
const monthly = rangeBuckets(points, "2024-02-29", { ...range, bucket: "monthly" }, "2024-03-04");
assert.equal(monthly[0].value, 3); // values before coverage cannot silently count
assert.equal(monthly[0].partial, true);
const days = rangeBuckets(points, "2024-02-29", range, "2024-03-04");
assert.deepEqual(days.map(p => p.value), [null, null, 3, 0, 0, 0, 5]);
assert.equal(rangeBuckets([], null, range, "2024-03-04").every(p => p.value === null), true);
const single = rangeBuckets(points, "2024-02-27", { from: "2024-03-04", to: "2024-03-04", bucket: "monthly" }, "2024-03-04");
assert.equal(single.length, 1);
assert.equal(single[0].value, 5);
const year = rangeBuckets([{ date: "2025-12-31", value: 3 }, { date: "2026-01-01", value: 4 }], "2025-12-31", { from: "2025-12-31", to: "2026-01-01", bucket: "weekly" }, "2026-01-02");
assert.equal(year.length, 1);
assert.equal(year[0].value, 7);
assert.equal(year[0].key, "2025-12-29");
const fullMonth = rangeBuckets([], "2024-01-01", { from: "2024-02-01", to: "2024-02-29", bucket: "monthly" }, "2024-03-01");
assert.equal(fullMonth[0].partial, false);
assert.equal(fullMonth[0].value, 0);

const summary = metricSummary([...points, { date: "2024-02-20", value: 4 }], "2024-02-20", range, "2024-03-04");
assert.deepEqual(summary, { value: 10, previous: 4, today: 5, partial: false });
assert.equal(metricSummary(points, "2024-02-27", range, "2024-03-04").previous, null);
assert.equal(metricSummary([], null, range, "2024-03-04").value, null);
assert.equal(metricSummary([], "2024-03-05", range, "2024-03-05").value, null);
assert.equal(changeLabel(5, 0, "회"), "+5회");
assert.equal(changeLabel(0, 0, "회"), "0회");
assert.equal(changeLabel(2, 4, "회"), "-2회 (-50%)");
assert.equal(changeLabel(2, null, "회"), "비교 기록 부족");
const weekdays = weekdayAverages(points, "2024-02-27", range, "2024-03-04");
assert.equal(weekdays[0].days, 0); // Monday is today, not an observed zero
assert.equal(weekdays[1].average, 2);
assert.equal(weekdays[2].average, 0);
assert.equal(weekdays[3].average, 3);
assert.equal(weekdays.reduce((n, p) => n + p.days, 0), 6);
assert.equal(weekdayAverages([], null, range, "2024-03-04").every(p => p.average === null), true);
const twoMondays = weekdayAverages([{ date: "2024-03-04", value: 6 }], "2024-03-04", { from: "2024-03-04", to: "2024-03-11" }, "2024-03-12");
assert.deepEqual([twoMondays[0].average, twoMondays[0].days], [3, 2]);

const makePost = (id: string, views: number, previous: number, activeDays: number, tags: string[]): PostPerformance => ({ id, title: id, slug: id, status: "PUBLISHED", views, previous, activeDays, tags });
const posts = [makePost("a", 20, 25, 5, ["react", "web"]), makePost("b", 10, 0, 8, ["react"]), makePost("c", 0, 0, 0, []), { ...makePost("d", 5, 0, 8, []), status: "DRAFT" }];
assert.deepEqual(rankPosts(posts, "views").map(p => p.id), ["a", "b", "d"]);
assert.deepEqual(rankPosts(posts, "growth").map(p => p.id), ["b", "d"]);
assert.deepEqual(rankPosts(posts, "days").map(p => p.id), ["b", "d", "a"]);
assert.equal(posts[0].id, "a"); // no mutation during ranking
assert.deepEqual(tagPerformance(posts), [{ tag: "react", views: 30, share: 60 }, { tag: "web", views: 20, share: 40 }]);
assert.deepEqual(topPostShare(posts), { count: 3, share: 100 });
assert.deepEqual(topPostShare([]), { count: 0, share: null });
const six = Array.from({ length: 6 }, (_, i) => makePost(String(i), i + 1, 0, 1, []));
assert.equal(topPostShare(six).share, 20 / 21 * 100);
assert.deepEqual(rankPosts([makePost("b", 1, 0, 1, []), makePost("a", 1, 0, 1, [])], "views").map(p => p.id), ["a", "b"]);

const defaultRange = analyticsRange(new URLSearchParams(), "2026-01-01");
assert.equal(defaultRange.from, "2025-12-03");
assert.equal(defaultRange.bucket, "daily");
for (const period of [7, 30, 90]) assert.equal(analyticsRange(new URLSearchParams(`period=${period}`), "2026-01-01").days, period);
assert.equal(analyticsRange(new URLSearchParams("period=custom&from=2024-02-30&to=2024-03-01"), "2024-03-04").preset, "30");
assert.equal(analyticsRange(new URLSearchParams("unit=invalid"), "2024-03-04").bucket, "daily");
const reversed = analyticsRange(new URLSearchParams("period=custom&from=2024-03-10&to=2024-02-27&unit=weekly"), "2024-03-04");
assert.equal(reversed.preset, "30", "invalid dates must not be silently swapped");
assert.equal(analyticsDateError("2024-03-02", "2024-03-01", "2024-03-04"), "종료일은 시작일보다 빠를 수 없습니다.");
assert.equal(analyticsDateError("2024-03-04", "2024-03-04", "2024-03-04"), null);
assert.ok(analyticsDateError("2024-02-30", "2024-03-01", "2024-03-04"));
assert.ok(analyticsDateError("2024-03-04", "2024-03-05", "2024-03-04"));
assert.ok(analyticsDateError(null, "2024-03-04", "2024-03-04"));
assert.deepEqual(analyticsRange(new URL(analyticsUrl(reversed), "https://test.local").searchParams, "2024-03-04"), reversed);

// 표시 단위가 바뀌어도 서버 요청·캐시 키는 같아야 한다.
const monthlyRange = { ...range, bucket: "monthly" as const };
assert.deepEqual(analyticsDataKey(range, "2024-03-04"), analyticsDataKey(monthlyRange, "2024-03-04"));
assert.equal(analyticsDataUrl(range), analyticsDataUrl(monthlyRange));
assert.notDeepEqual(analyticsDataKey(range, "2024-03-04"), analyticsDataKey({ ...range, from: "2024-02-28" }, "2024-03-04"));
assert.equal(new URL(analyticsDataUrl(range), "https://test.local").searchParams.has("unit"), false);

// Different bucket counts preserve both endpoint shapes and interpolate x as well as y.
const oldPath = "M20,80 L60,20 L100,60";
const newPath = "M0,40 L100,10";
const morph = chartMorph(oldPath, newPath);
assert.equal(morph(0), oldPath);
assert.equal(morph(1), newPath);
assert.equal(morph(0.5), "M10,60 L55,22.5 L100,35");
assert.equal(chartMorph(morph(0.4), oldPath)(0), morph(0.4), "interrupted transitions resume from current shape");
assert.equal(chartMorph("M50,50", newPath)(0.5), "M25,45 L75,30");
assert.equal(chartMorph("", newPath)(0.5), newPath);

console.log("Admin analytics: periods, buckets, comparisons, rankings, shares and unit-independent request keys passed.");
