import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { AdminWrapper, PostTable, Button } from "@/components/admin/Admin.styled";
import PostTableRow from "@/components/admin/PostTableRow";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const posts = await getAllPostsForAdmin();
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const comments = posts.reduce((sum, p) => sum + p.commentCount, 0);

    return (
        <AdminWrapper>
            <div className="admin-head">
                <h2>포스트 관리</h2>
                <Link href="/admin/posts/new">
                    <Button as="span" className="primary">
                        새 글 쓰기
                    </Button>
                </Link>
            </div>

            <div className="stat-row">
                <div className="stat">
                    <p className="label">전체</p>
                    <p className="value">{posts.length}</p>
                </div>
                <div className="stat">
                    <p className="label">발행</p>
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
        </AdminWrapper>
    );
}
