"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import Dropdown from "@/components/ui/Dropdown";
import { commentListUrl } from "@/lib/admin-navigation";
import { TableToolbar } from "./Admin.styled";

type Status = "all" | "live" | "deleted";
type Filter = { post?: string; author?: string; status: Status };
type Props = Filter & {
    counts: Record<Status, number>;
    returnTo: string;
    options: { posts: { slug: string; title: string }[]; authors: { id: string; username: string }[] };
    /** 목록. 새 조건의 결과가 오는 동안 흐리게 둔다 */
    children: ReactNode;
};

/**
 * 댓글 목록 툴바. 포스트 목록의 TableToolbar 를 그대로 써서 상태 세그먼트 · 드롭다운 · 초기화의
 * 높이와 모양을 맞춘다. 고르면 URL 만 바꾸고 서버가 다시 그린다.
 *
 * 행 안의 이름·제목을 눌러 좁히는 방식은 "무엇으로 거를 수 있는지" 가 화면에 안 보여서
 * 발견하기 어렵다. 위에 드러내 둔다.
 *
 * 조건마다 서버 왕복이라(25개씩 페이지네이션) 결과가 올 때까지 틈이 생긴다.
 * 그 사이 컨트롤은 방금 고른 값을 보여주고(useOptimistic) 목록만 흐리게 둔다.
 * 서버 렌더가 끝나 props 가 바뀌면 낙관값은 알아서 버려진다.
 */
export default function CommentFilters({ post, author, status, counts, returnTo, options, children }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [shown, choose] = useOptimistic<Filter, Partial<Filter>>({ post, author, status }, (current, patch) => ({ ...current, ...patch }));
    const go = (patch: Partial<Filter>) => startTransition(() => {
        choose(patch);
        router.push(commentListUrl({ ...shown, ...patch, returnTo, page: 1 }));
    });
    const reset = () => go({ post: undefined, author: undefined, status: "all" });
    const pristine = shown.status === "all" && !shown.post && !shown.author;
    return (
        <>
        <TableToolbar>
            <div className="status-filters" role="group" aria-label="댓글 상태">
                {([['all', '전체'], ['live', '게시 중'], ['deleted', '삭제됨']] as const).map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={shown.status === value} onClick={() => go({ status: value })}>
                        {label} {counts[value]}
                    </button>
                ))}
            </div>
            <Dropdown className="post-filter" label="글로 거르기" size="control" value={shown.post ?? ""}
                options={[{ value: "", label: "모든 글" }, ...options.posts.map((p) => ({ value: p.slug, label: p.title }))]}
                onChange={(value) => go({ post: value || undefined })} />
            <Dropdown label="작성자로 거르기" size="control" value={shown.author ?? ""}
                options={[{ value: "", label: "모든 작성자" }, ...options.authors.map((a) => ({ value: a.id, label: a.username }))]}
                onChange={(value) => go({ author: value || undefined })} />
            <button type="button" disabled={pristine} onClick={reset}>초기화</button>
        </TableToolbar>
        <Results aria-busy={isPending || undefined}>{children}</Results>
        </>
    );
}

/* 결과가 바뀌는 중임을 목록 전체로 알린다. 잠깐이라 opacity 로 충분하다 — 대비를 낮추는 게 아니라 "지금은 옛 결과" 라는 표시다 */
const Results = styled.div`
    transition: opacity .15s;
    &[aria-busy="true"] { opacity: .5; pointer-events: none; }
`;
