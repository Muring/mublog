import { Suspense } from "react";
import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { AdminWrapper, PostTable, Button } from "@/components/admin/Admin.styled";
import { StatRowSkeleton, PostTableSkeleton } from "@/components/admin/AdminSkeleton";
import PostTableRow from "@/components/admin/PostTableRow";

export const dynamic = "force-dynamic";

/**
 * 목록과 통계는 같은 조회 하나에서 나온다.
 *
 * 이 부분만 Suspense 로 감싸 두면, DB 를 기다리는 동안에도
 * 제목과 "새 글 쓰기" 는 먼저 그려진다. 눌러서 바로 글을 쓰러 갈 수 있다.
 */
async function PostList() {
    const posts = await getAllPostsForAdmin();
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const comments = posts.reduce((sum, p) => sum + p.commentCount, 0);

    return (
        <>
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
        </>
    );
}

export default function AdminPage() {
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

            <Suspense
                fallback={
                    <>
                        <StatRowSkeleton />
                        <PostTableSkeleton />
                    </>
                }
            >
                <PostList />
            </Suspense>
        </AdminWrapper>
    );
}
