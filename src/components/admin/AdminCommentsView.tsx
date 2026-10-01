import Link from "next/link";
import type { getCommentsForAdmin } from "@/lib/comments";
import { commentListUrl, pageWindow, type CommentSort } from "@/lib/admin-navigation";
import { AdminListScroll } from "./Admin.styled";
import AdminCommentList from "./AdminCommentList";
import CommentFilters from "./CommentFilters";
import styles from "./Management.module.css";
import { splitMulti } from "@/lib/multi-value";

type Props = {
    result: Awaited<ReturnType<typeof getCommentsForAdmin>>;
    status: "all" | "live" | "deleted";
    sort: CommentSort;
    q?: string;
    from: string;
    to: string;
    postSlug?: string;
    authorId?: string;
    returnTo: string;
};
export default function AdminCommentsView({ result, status, sort, q, from, to, postSlug, authorId, returnTo }: Props) {
    const href = (patch: { status?: string; page?: number } = {}) => commentListUrl({ post: postSlug, author: authorId, q, from, to, status, sort, returnTo, page: result.page, ...patch });
    const total = result.counts[status];
    return (
        <>
            <CommentFilters post={postSlug} author={authorId} q={q ?? ""} from={from} to={to} status={status} sort={sort} counts={result.counts} returnTo={returnTo} options={result.options}
                summary={total === 0 ? "0개 표시" : `${total.toLocaleString("ko-KR")}개 중 ${result.skip + 1}–${result.skip + result.comments.length}개 표시`}>
                <AdminListScroll key={href()}>
                    {result.comments.length ? <AdminCommentList comments={result.comments} postFiltered={splitMulti(postSlug).length === 1} /> : <p className={styles.compact}>해당 조건의 댓글이 없습니다.</p>}
                </AdminListScroll>
            </CommentFilters>
            {/* 번호를 같이 둔다. 이전/다음뿐이면 댓글이 쌓였을 때 오래된 쪽까지 한 칸씩 걸어가야 한다 */}
            <nav className={styles.pagination} aria-label="댓글 페이지">
                {result.page > 1 ? <Link href={href({ page: result.page - 1 })}>이전</Link> : <span aria-disabled="true">이전</span>}
                {pageWindow(result.page, result.pages).map((n, i) => n === null
                    ? <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">…</span>
                    : n === result.page
                        ? <span key={n} aria-current="page">{n}</span>
                        : <Link key={n} href={href({ page: n })} aria-label={`${n}페이지`}>{n}</Link>)}
                {result.page < result.pages ? <Link href={href({ page: result.page + 1 })}>다음</Link> : <span aria-disabled="true">다음</span>}
            </nav>
        </>
    );
}
