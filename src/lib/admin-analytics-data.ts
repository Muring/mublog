import { prisma } from "@/lib/prisma";
import type { AnalyticsData, AnalyticsRange, MetricPoint, PostPerformance } from "./admin-analytics";

/** Admin-only caller. Return DATE as text: pg otherwise interprets it in the server timezone. */
export async function getAdminAnalytics(range: AnalyticsRange, today: string): Promise<AnalyticsData> {
    const [starts, visits, views, posts] = await prisma.$transaction([
        prisma.$queryRaw<{ visits: string | null; views: string | null }[]>`
            SELECT (SELECT MIN(date)::text FROM daily_stats) AS visits,
                   (SELECT MIN(date)::text FROM post_daily_views) AS views`,
        prisma.$queryRaw<MetricPoint[]>`
            SELECT date::text AS date, visitors AS value FROM daily_stats
             WHERE date BETWEEN ${range.previousFrom}::date AND ${range.to}::date OR date = ${today}::date
             ORDER BY date`,
        prisma.$queryRaw<MetricPoint[]>`
            SELECT date::text AS date, SUM(views)::int AS value FROM post_daily_views
             WHERE date BETWEEN ${range.previousFrom}::date AND ${range.to}::date OR date = ${today}::date
             GROUP BY date ORDER BY date`,
        prisma.$queryRaw<PostPerformance[]>`
            SELECT p.id, p.slug, p.title, p.status::text AS status, p.tags,
                   COALESCE(SUM(v.views) FILTER (WHERE v.date BETWEEN ${range.from}::date AND ${range.to}::date), 0)::int AS views,
                   COALESCE(SUM(v.views) FILTER (WHERE v.date BETWEEN ${range.previousFrom}::date AND ${range.previousTo}::date), 0)::int AS previous,
                   COUNT(*) FILTER (WHERE v.date BETWEEN ${range.from}::date AND ${range.to}::date AND v.views > 0)::int AS "activeDays"
              FROM posts p JOIN post_daily_views v ON v.post_id = p.id
             WHERE v.date BETWEEN ${range.previousFrom}::date AND ${range.to}::date
             GROUP BY p.id`,
    ], { isolationLevel: "RepeatableRead" });
    return { range, today, visits, views, posts, visitsSince: starts[0].visits, viewsSince: starts[0].views };
}
