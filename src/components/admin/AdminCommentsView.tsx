import Link from "next/link";
import type { getCommentsForAdmin } from "@/lib/comments";
import { commentListUrl, pageWindow, type CommentListState } from "@/lib/admin-navigation";
import { AdminListScroll, Pagination } from "./Admin.styled";
import AdminCommentList from "./AdminCommentList";
import CommentFilters from "./CommentFilters";
import { splitMulti } from "@/lib/multi-value";

type Props = {
    result: Awaited<ReturnType<typeof getCommentsForAdmin>>;
    state: CommentListState;
};
export default function AdminCommentsView({ result, state }: Props) {
    const href = (patch: { page?: number } = {}) => commentListUrl({ ...state, page: result.page, ...patch });
    const { post, author, q, from, to, status, sort, returnTo } = state;
    const total = result.counts[status];
    return (
        <>
            <CommentFilters post={post} author={author} q={q} from={from} to={to} status={status} sort={sort} counts={result.counts} returnTo={returnTo} options={result.options}
                summary={total === 0 ? "0개 표시" : `${total.toLocaleString("ko-KR")}개 중 ${result.skip + 1}–${result.skip + result.comments.length}개 표시`}>
                <AdminListScroll key={href()}>
                    {result.comments.length ? <AdminCommentList comments={result.comments} postFiltered={splitMulti(post).length === 1} /> : <p className="empty">해당 조건의 댓글이 없습니다.</p>}
                </AdminListScroll>
            </CommentFilters>
            {/* 쪽 이동도 조건처럼 기록을 쌓지 않는다(replace). 번호를 같이 둔다. 이전/다음뿐이면 댓글이 쌓였을 때 오래된 쪽까지 한 칸씩 걸어가야 한다 */}
            <Pagination aria-label="댓글 페이지">
                {result.page > 1 ? <Link replace href={href({ page: result.page - 1 })}>이전</Link> : <span aria-disabled="true">이전</span>}
                {pageWindow(result.page, result.pages).map((n, i) => n === null
                    ? <span key={`gap-${i}`} className="gap" aria-hidden="true">…</span>
                    : n === result.page
                        ? <span key={n} aria-current="page">{n}</span>
                        : <Link key={n} replace href={href({ page: n })} aria-label={`${n}페이지`}>{n}</Link>)}
                {result.page < result.pages ? <Link replace href={href({ page: result.page + 1 })}>다음</Link> : <span aria-disabled="true">다음</span>}
            </Pagination>
        </>
    );
}
