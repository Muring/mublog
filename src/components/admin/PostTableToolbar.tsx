"use client";

import { useEffect, useRef } from "react";
import Dropdown from "@/components/ui/Dropdown";
import type { PostListState, PostSort, PostStatusFilter } from "@/lib/admin-navigation";
import { adminDateLabel } from "@/lib/admin-filters";
import FilterBar from "./FilterBar";
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

/** 실제 목록과 로딩에서 같은 툴바 구조를 사용한다. */
export default function PostTableToolbar({ state, counts, onChange, options = { tags: [], series: [] }, loading = false }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const composing = useRef(false);
    useEffect(() => {
        if (input.current && !composing.current) input.current.value = state.q;
    }, [state.q]);

    const chips = [
        ...(state.status !== "all" ? [{ key: "status", name: "상태", value: state.status === "PUBLISHED" ? "공개" : "초안" }] : []),
        ...(state.tag ? [{ key: "tag", name: "태그", value: state.tag }] : []),
        ...(state.series ? [{ key: "series", name: "시리즈", value: state.series }] : []),
        ...(state.from || state.to ? [{ key: "date", name: "작성일", value: adminDateLabel(state.from ?? "", state.to ?? "") }] : []),
        ...(state.hasComments ? [{ key: "hasComments", name: "댓글", value: state.hasComments === "yes" ? "있음" : "없음" }] : []),
    ];
    // 초기화는 걸린 조건만 푼다. 정렬은 보는 방식이지 조건이 아니다
    const reset = () => onChange({ q: "", tag: "", series: "", status: "all", from: "", to: "", hasComments: "" });

    return (
        <>
        <FilterBar
            loading={loading}
            status={
                <div className="status-filters" role="group" aria-label="포스트 상태">
                    {([['all', '전체'], ['PUBLISHED', '공개'], ['DRAFT', '초안']] as const).map(([value, label]) => (
                        <button key={value} type="button" aria-pressed={state.status === value} onClick={() => onChange({ status: value })}>
                            {label}<span className="filter-count">{loading ? "00" : counts[value]}</span>
                        </button>
                    ))}
                </div>
            }
            sort={
                <Dropdown className="sort-control" label="포스트 정렬" size="control" variant="ghost" value={state.sort} align="right"
                    options={[{ value: 'newest', label: '최신순' }, { value: 'updated', label: '수정순' }, { value: 'views', label: '조회순' }, { value: 'comments', label: '댓글순' }]}
                    onChange={(value) => onChange({ sort: value as PostSort })} />
            }
            search={
                <input type="search" ref={input} defaultValue={state.q} readOnly={loading}
                    onCompositionStart={() => { composing.current = true; }}
                    onCompositionEnd={(event) => { composing.current = false; onChange({ q: event.currentTarget.value }); }}
                    onChange={(event) => { if (!composing.current) onChange({ q: event.currentTarget.value }); }}
                    placeholder="제목 · 주소 · 태그 검색" aria-label="포스트 검색" />
            }
            fields={[
                { key: "tag", label: "태그", search: "태그 검색", options: [{ value: "", label: "전체" }, ...options.tags.map((t) => ({ value: t.name, label: t.name, hint: String(t.count) }))] },
                ...(options.series.length > 0 ? [{ key: "series", label: "시리즈", search: "시리즈 검색", options: [{ value: "", label: "전체" }, ...options.series.map((s) => ({ value: s.name, label: s.name, hint: String(s.count) }))] }] : []),
                { key: "hasComments", label: "댓글 유무", options: [{ value: "", label: "전체" }, { value: "yes", label: "댓글 있음" }, { value: "no", label: "댓글 없음" }] },
            ]}
            dateRange
            dateBefore="hasComments"
            values={{ tag: state.tag, series: state.series, from: state.from ?? "", to: state.to ?? "", hasComments: state.hasComments ?? "" }}
            onApply={({ tag, series, from, to, hasComments }) => onChange({ tag, series, from, to, hasComments: hasComments as PostListState["hasComments"] })}
            fieldCount={chips.filter((chip) => chip.key !== "status").length}
            summary={`${counts[state.status].toLocaleString("ko-KR")}개 표시`}
            chips={!loading && <FilterChips items={chips} onClear={reset} canClear={chips.length > 0 || Boolean(state.q) || state.status !== "all"}
                onRemove={(key) => onChange(key === "date" ? { from: "", to: "" } : { [key]: key === "status" ? "all" : "" })} />}
        />
        </>
    );
}
