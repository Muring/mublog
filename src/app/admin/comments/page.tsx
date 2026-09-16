import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getCommentsForAdmin } from "@/lib/comments";
import { AdminWrapper, Button } from "@/components/admin/Admin.styled";
import AdminCommentList from "@/components/admin/AdminCommentList";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ post?: string }> };

/**
 * 댓글 관리. /admin 의 "댓글" 카드와 표의 댓글 수에서 들어온다.
 * ?post=<slug> 면 그 글의 댓글만 보여준다.
 */
export default async function AdminCommentsPage({ searchParams }: Props) {
    await requireAdmin();

    const { post } = await searchParams;
    const comments = await getCommentsForAdmin(post);
    const live = comments.filter((c) => !c.deleted).length;
    const postTitle = post ? comments[0]?.post.title : undefined;

    return (
        <AdminWrapper>
            <div className="admin-head">
                <div>
                    <h2>댓글 관리</h2>
                    {post && (
                        <p className="sub">
                            {postTitle ? `『${postTitle}』의 댓글` : `/${post} 의 댓글`} ·{" "}
                            <Link href="/admin/comments">전체 보기</Link>
                        </p>
                    )}
                </div>
                <Link href="/admin">
                    <Button as="span">← 포스트 관리</Button>
                </Link>
            </div>

            <p className="summary">
                전체 <strong>{comments.length}</strong> · 삭제됨 <strong>{comments.length - live}</strong>
            </p>

            {comments.length === 0 ? (
                <p className="empty">{post ? "이 글에는 댓글이 없습니다." : "아직 댓글이 없습니다."}</p>
            ) : (
                <AdminCommentList comments={comments} />
            )}
        </AdminWrapper>
    );
}
