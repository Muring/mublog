"use client";

import { useEffect, useRef } from "react";
import Dropdown from "@/components/ui/Dropdown";
import type { PostListState, PostSort, PostStatusFilter } from "@/lib/admin-navigation";
import { Skeleton, TableToolbar } from "./Admin.styled";
import FilterChips from "./FilterChips";

type Option = { name: string; count: number };
type Props = {
    state: PostListState;
    counts: Record<PostStatusFilter, number>;
    onChange: (patch: Partial<PostListState>) => void;
    /** 태그·시리즈 드롭다운 항목. 많이 쓴 순 */
    options?: { tags: Option[]; series: Option[] };
    loading?: boolean;
};
const STATUS_LABEL: Record<PostStatusFilter, string> = { all: "전체", PUBLISHED: "공개", DRAFT: "초안" };

/** 실제 목록과 로딩에서 폭·줄바꿈·컨트롤 구조를 공유한다. */
/**
 * 태그·시리즈 필터는 검색형 드롭다운이다. 검색창도 태그를 찾지만 제목·주소까지 같이 걸려서
 * "이 태그가 붙은 글만" 을 정확히 고를 수 없고, 어떤 태그가 몇 개 있는지도 안 보인다.
 * 시리즈가 하나도 없으면 시리즈 드롭다운은 그리지 않는다.
 */
export default function PostTableToolbar({ state, counts, onChange, options = { tags: [], series: [] }, loading = false }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const composing = useRef(false);
    useEffect(() => {
        if (input.current && !composing.current) input.current.value = state.q;
    }, [state.q]);

    return (
        <>
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
                placeholder="제목 · 주소 · 태그 검색" aria-label="포스트 검색" />
            <Dropdown label="태그 필터" size="control" value={state.tag} searchable="태그 검색"
                options={[{ value: "", label: "모든 태그" }, ...options.tags.map((t) => ({ value: t.name, label: t.name, hint: String(t.count) }))]}
                onChange={(value) => onChange({ tag: value })} />
            {options.series.length > 0 && (
                <Dropdown label="시리즈 필터" size="control" value={state.series} searchable="시리즈 검색"
                    options={[{ value: "", label: "모든 시리즈" }, ...options.series.map((s) => ({ value: s.name, label: s.name, hint: String(s.count) }))]}
                    onChange={(value) => onChange({ series: value })} />
            )}
            <Dropdown className="sort-control" label="포스트 정렬" size="control" value={state.sort}
                options={[{ value: 'newest', label: '최신순' }, { value: 'updated', label: '수정순' }, { value: 'views', label: '조회순' }, { value: 'comments', label: '댓글순' }]}
                onChange={(value) => onChange({ sort: value as PostSort })} />
            <button type="button" disabled={!state.q && !state.tag && !state.series && state.status === "all" && state.sort === "newest"}
                onClick={() => onChange({ q: "", tag: "", series: "", status: "all", sort: "newest" })}>초기화</button>
        </TableToolbar>
        {!loading && <FilterChips items={[
            ...(state.status !== "all" ? [{ key: "status", name: "상태", value: STATUS_LABEL[state.status] }] : []),
            ...(state.q ? [{ key: "q", name: "검색", value: state.q }] : []),
            ...(state.tag ? [{ key: "tag", name: "태그", value: state.tag }] : []),
            ...(state.series ? [{ key: "series", name: "시리즈", value: state.series }] : []),
        ]} onRemove={(key) => onChange(key === "status" ? { status: "all" } : { [key]: "" })} />}
        </>
    );
}
