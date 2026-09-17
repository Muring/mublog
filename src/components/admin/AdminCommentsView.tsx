import Link from "next/link";
import type { getCommentsForAdmin } from "@/lib/comments";
import { commentListUrl } from "@/lib/admin-navigation";
import AdminCommentList from "./AdminCommentList";
import CommentFilters from "./CommentFilters";
import styles from "./Management.module.css";

type Props = {
    result: Awaited<ReturnType<typeof getCommentsForAdmin>>;
    status: "all" | "live" | "deleted";
    postSlug?: string;
    authorId?: string;
    returnTo: string;
};
export default function AdminCommentsView({ result, status, postSlug, authorId, returnTo }: Props) {
    const href = (patch: { status?: string; page?: number } = {}) => commentListUrl({ post: postSlug, author: authorId, status, returnTo, page: result.page, ...patch });
    const total = result.counts[status];
    return (
        <>
            <CommentFilters post={postSlug} author={authorId} status={status} counts={result.counts} returnTo={returnTo} options={result.options}>
                <p className={styles.summary}>{total === 0 ? "0개" : `${total.toLocaleString('ko-KR')}개 중 ${result.skip + 1}–${result.skip + result.comments.length}개 표시`} · 최신순</p>
                {result.comments.length ? <AdminCommentList comments={result.comments} /> : <p className={styles.compact}>해당 조건의 댓글이 없습니다.</p>}
            </CommentFilters>
            <nav className={styles.pagination} aria-label="댓글 페이지">
                {result.page > 1 ? <Link href={href({ page: result.page - 1 })}>이전</Link> : <span aria-disabled="true">이전</span>}
                <span aria-current="page">{result.page} / {result.pages}</span>
                {result.page < result.pages ? <Link href={href({ page: result.page + 1 })}>다음</Link> : <span aria-disabled="true">다음</span>}
            </nav>
        </>
    );
}
