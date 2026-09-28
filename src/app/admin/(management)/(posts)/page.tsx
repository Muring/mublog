import { Suspense } from "react";
import { seoulDateKey } from "@/lib/date";
import { requireAdmin } from "@/lib/auth";
import { getAllPostsForAdmin } from "@/lib/posts";
import { getDailyVisitors, getSiteStats, getTagDailyViews } from "@/lib/stats";
import PostTableView from "@/components/admin/PostTableView";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

export const dynamic = "force-dynamic";

/** 데이터 로딩은 loading.tsx, URL 검색 상태의 경계는 목록 내부에서 처리한다. */
export default async function AdminPage() {
    // 인가는 레이아웃이 아니라 여기서 확정한다 (layout.tsx 의 주석 참고)
    await requireAdmin();

    const [posts, daily, stats, tagViews] = await Promise.all([
        getAllPostsForAdmin(),
        getDailyVisitors(),
        getSiteStats(),
        getTagDailyViews(),
    ]);
    return (
        <>
            <AdminAnalytics points={daily} tags={tagViews} today={seoulDateKey()} totalVisitors={stats.total} />

            <Suspense><PostTableView posts={posts} /></Suspense>
        </>
    );
}
