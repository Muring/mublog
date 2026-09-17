"use client";

import { useEffect, useRef } from "react";
import Dropdown from "@/components/ui/Dropdown";
import type { PostSort, PostStatusFilter } from "@/lib/admin-navigation";
import { Skeleton, TableToolbar } from "./Admin.styled";

type State = { q: string; status: PostStatusFilter; sort: PostSort };
type Props = {
    state: State;
    counts: Record<PostStatusFilter, number>;
    onChange: (patch: Partial<State>) => void;
    loading?: boolean;
};

/** 실제 목록과 로딩에서 폭·줄바꿈·컨트롤 구조를 공유한다. */
export default function PostTableToolbar({ state, counts, onChange, loading = false }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const composing = useRef(false);
    useEffect(() => {
        if (input.current && !composing.current) input.current.value = state.q;
    }, [state.q]);

    return (
        <TableToolbar data-loading={loading || undefined}>
            <div className="status-filters" role="group" aria-label="포스트 상태">
                {([['all', '전체'], ['PUBLISHED', '공개'], ['DRAFT', '초안']] as const).map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={state.status === value} onClick={() => onChange({ status: value })}>
                        {label} <span className="filter-count">
                            <span style={{ visibility: loading ? "hidden" : undefined }}>{counts[value]}</span>
                            {loading && <Skeleton className="filter-count-placeholder" />}
                        </span>
                    </button>
                ))}
            </div>
            <input type="search" ref={input} defaultValue={state.q} readOnly={loading}
                onCompositionStart={() => { composing.current = true; }}
                onCompositionEnd={(event) => { composing.current = false; onChange({ q: event.currentTarget.value }); }}
                onChange={(event) => { if (!composing.current) onChange({ q: event.currentTarget.value }); }}
                placeholder="제목 · 주소 · 태그로 거르기" aria-label="포스트 검색" />
            <Dropdown className="sort-control" label="포스트 정렬" size="control" value={state.sort}
                options={[{ value: 'newest', label: '최신순' }, { value: 'updated', label: '수정순' }, { value: 'views', label: '조회순' }, { value: 'comments', label: '댓글순' }]}
                onChange={(value) => onChange({ sort: value as PostSort })} />
            <button type="button" disabled={!state.q && state.status === "all" && state.sort === "newest"}
                onClick={() => onChange({ q: "", status: "all", sort: "newest" })}>초기화</button>
        </TableToolbar>
    );
}
