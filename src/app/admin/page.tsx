import { requireAdmin } from "@/lib/auth";
import { getAllPostsForAdmin } from "@/lib/posts";
import { getDailyVisitors, getSiteStats } from "@/lib/stats";
import { AdminShell } from "@/components/admin/AdminSkeleton";
import PostTableView from "@/components/admin/PostTableView";
import VisitorChart from "@/components/admin/VisitorChart";

export const dynamic = "force-dynamic";

/**
 * 여기서 Suspense 를 쓰지 않는다.
 *
 * loading.tsx 가 이미 같은 뼈대를 즉시 보여준다. 안쪽에 경계를 하나 더 두면
 * 스켈레톤이 두 번 그려지고, 그때마다 DOM 이 갈아끼워지며 화면이 깜빡인다.
 * 목록 조회가 10ms 라 껍데기를 먼저 흘려보내서 얻는 것도 없다.
 *
 * 껍데기(AdminShell)는 loading.tsx 와 같은 컴포넌트를 쓴다.
 * 둘이 조금이라도 다르면 넘어가는 순간 한 번 더 튄다.
 */
export default async function AdminPage() {
    // 인가는 레이아웃이 아니라 여기서 확정한다 (layout.tsx 의 주석 참고)
    await requireAdmin();

    const [posts, daily, stats] = await Promise.all([
        getAllPostsForAdmin(),
        getDailyVisitors(),
        getSiteStats(),
    ]);
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const comments = posts.reduce((sum, p) => sum + p.commentCount, 0);

    return (
        <AdminShell>
            <div className="stat-row">
                <div className="stat">
                    <p className="label">전체</p>
                    <p className="value">{posts.length}</p>
                </div>
                <div className="stat">
                    <p className="label">공개</p>
                    <p className="value">{published}</p>
                </div>
                <div className="stat">
                    <p className="label">초안</p>
                    <p className="value">{posts.length - published}</p>
                </div>
                <div className="stat">
                    <p className="label">댓글</p>
                    <p className="value">{comments}</p>
                </div>
            </div>

            <VisitorChart points={daily} totalVisitors={stats.total} />

            <PostTableView posts={posts} />
        </AdminShell>
    );
}
