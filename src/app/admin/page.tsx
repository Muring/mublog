import { getAllPostsForAdmin } from "@/lib/posts";
import { PostTable } from "@/components/admin/Admin.styled";
import { AdminShell } from "@/components/admin/AdminSkeleton";
import PostTableRow from "@/components/admin/PostTableRow";

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
    const posts = await getAllPostsForAdmin();
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

            <PostTable>
                <thead>
                    <tr>
                        <th>제목</th>
                        <th>상태</th>
                        <th>태그</th>
                        <th>발행일</th>
                        <th>댓글</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <PostTableRow key={post.id} post={post} />
                    ))}
                </tbody>
            </PostTable>
        </AdminShell>
    );
}
