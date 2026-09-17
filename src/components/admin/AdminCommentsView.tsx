import Link from "next/link";
import type { getCommentsForAdmin } from "@/lib/comments";
import { commentListUrl } from "@/lib/admin-navigation";
import AdminCommentList from "./AdminCommentList";
import styles from "./Management.module.css";

type Props = {
    result: Awaited<ReturnType<typeof getCommentsForAdmin>>;
    status: "all" | "live" | "deleted";
    postSlug?: string;
    returnTo: string;
};
export default function AdminCommentsView({ result, status, postSlug, returnTo }: Props) {
    const href = (patch: { post?: string; status?: string; page?: number } = {}) => commentListUrl({ post: postSlug, status, page: result.page, returnTo, ...patch });
    const total = result.counts[status];
    return (
        <>
            {result.post && <div className={styles.postFilter}><strong>『{result.post.title}』의 댓글</strong><Link href={href({ post: undefined, page: 1 })}>글 필터 해제</Link></div>}
            <div className={styles.filters} aria-label="댓글 상태">
                {([['all', '전체'], ['live', '게시 중'], ['deleted', '삭제됨']] as const).map(([value, label]) =>
                    <Link key={value} href={href({ status: value, page: 1 })} aria-current={status === value ? "true" : undefined}>{label} {result.counts[value]}</Link>
                )}
            </div>
            <p className={styles.summary}>{total === 0 ? "0개" : `${total.toLocaleString('ko-KR')}개 중 ${result.skip + 1}–${result.skip + result.comments.length}개 표시`} · 최신순</p>
            {result.comments.length ? <AdminCommentList comments={result.comments} /> : <p className={styles.compact}>해당 조건의 댓글이 없습니다.</p>}
            <nav className={styles.pagination} aria-label="댓글 페이지">
                {result.page > 1 ? <Link href={href({ page: result.page - 1 })}>이전</Link> : <span aria-disabled="true">이전</span>}
                <span aria-current="page">{result.page} / {result.pages}</span>
                {result.page < result.pages ? <Link href={href({ page: result.page + 1 })}>다음</Link> : <span aria-disabled="true">다음</span>}
            </nav>
        </>
    );
}
