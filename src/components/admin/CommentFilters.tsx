"use client";

import { useEffect, useOptimistic, useRef, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import Dropdown from "@/components/ui/Dropdown";
import { COMMENT_QUERY_MAX, commentListUrl, type CommentSort } from "@/lib/admin-navigation";
import { adminDateLabel } from "@/lib/admin-filters";
import FilterBar from "./FilterBar";
import FilterChips from "./FilterChips";

type Status = "all" | "live" | "deleted";
type Filter = { post?: string; author?: string; q: string; from: string; to: string; status: Status; sort: CommentSort };
type Props = Filter & {
    counts: Record<Status, number>;
    returnTo: string;
    options: { posts: { slug: string; title: string; count: number }[]; authors: { id: string; username: string; count: number }[] };
    summary: string;
    children: ReactNode;
};
const SEARCH_DELAY = 200;

/** 검색은 조합 완료 후 지연 반영하고, 상세 조건은 폼에서 한 번에 적용한다. */
export default function CommentFilters({ post, author, q, from, to, status, sort, counts, returnTo, options, summary, children }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [shown, choose] = useOptimistic<Filter, Partial<Filter>>({ post, author, q, from, to, status, sort }, (current, patch) => ({ ...current, ...patch }));
    const queryInput = useRef<HTMLInputElement>(null);
    const composing = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    // 같은 프레임에 여러 조작이 들어와도 직전 선택을 잃지 않는다.
    const latest = useRef(shown);
    useEffect(() => { latest.current = shown; }, [shown]);
    const go = (patch: Partial<Filter>, replace = false) => {
        clearTimeout(timer.current);
        const next = { ...latest.current, q: composing.current ? latest.current.q : (queryInput.current?.value.trim() ?? latest.current.q), ...patch };
        latest.current = next;
        startTransition(() => {
            choose(next);
            const url = commentListUrl({ ...next, returnTo, page: 1 });
            if (replace) router.replace(url, { scroll: false });
            else router.push(url, { scroll: false });
        });
    };
    useEffect(() => {
        if (queryInput.current && document.activeElement !== queryInput.current && !composing.current) queryInput.current.value = q;
    }, [q]);
    useEffect(() => () => clearTimeout(timer.current), []);
    const schedule = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (!composing.current && queryInput.current?.value.trim() !== latest.current.q) go({}, true);
        }, SEARCH_DELAY);
    };
    const reset = () => {
        if (queryInput.current) queryInput.current.value = "";
        go({ post: undefined, author: undefined, q: "", from: "", to: "", status: "all" });
    };
    const chips: { key: string; name: string; value: string; patch: Partial<Filter> }[] = [
        ...(shown.status !== "all" ? [{ key: "status", name: "상태", value: shown.status === "live" ? "게시 중" : "삭제됨", patch: { status: "all" as const } }] : []),
        ...(shown.post ? [{ key: "post", name: "글", value: options.posts.find((p) => p.slug === shown.post)?.title ?? shown.post, patch: { post: undefined } }] : []),
        ...(shown.author ? [{ key: "author", name: "작성자", value: options.authors.find((a) => a.id === shown.author)?.username ?? shown.author, patch: { author: undefined } }] : []),
        ...(shown.from || shown.to ? [{ key: "date", name: "작성일", value: adminDateLabel(shown.from, shown.to), patch: { from: "", to: "" } }] : []),
    ];
    return (
        <>
            <FilterBar
                status={<div className="status-filters" role="group" aria-label="댓글 상태">
                    {([['all', '전체'], ['live', '게시 중'], ['deleted', '삭제됨']] as const).map(([value, label]) => (
                        <button key={value} type="button" aria-pressed={shown.status === value} onClick={() => go({ status: value })}>
                            {label}<span className="filter-count">{counts[value]}</span>
                        </button>
                    ))}
                </div>}
                sort={<Dropdown label="댓글 정렬" size="control" variant="ghost" value={shown.sort} align="right"
                    options={[{ value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" }]}
                    onChange={(value) => go({ sort: value as CommentSort })} />}
                search={<input type="search" ref={queryInput} defaultValue={q} maxLength={COMMENT_QUERY_MAX}
                    onCompositionStart={() => { composing.current = true; clearTimeout(timer.current); }}
                    onCompositionEnd={() => { composing.current = false; schedule(); }}
                    onChange={() => { if (!composing.current) schedule(); }}
                    onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) go({}, true); }}
                    placeholder="댓글 본문 검색" aria-label="댓글 본문 검색" />}
                fields={[
                    { key: "post", label: "글", search: "글 제목 검색", options: [{ value: "", label: "전체" }, ...options.posts.map((p) => ({ value: p.slug, label: p.title, hint: String(p.count) }))] },
                    { key: "author", label: "작성자", search: "이름 검색", options: [{ value: "", label: "전체" }, ...options.authors.map((a) => ({ value: a.id, label: a.username, hint: String(a.count) }))] },
                ]}
                values={{ post: shown.post ?? "", author: shown.author ?? "", from: shown.from, to: shown.to }}
                dateRange
                onApply={(next) => go({ post: next.post || undefined, author: next.author || undefined, from: next.from, to: next.to })}
                fieldCount={chips.filter((chip) => chip.key !== "status").length}
                summary={summary}
                pending={isPending}
                chips={<FilterChips items={chips} onClear={reset} canClear={chips.length > 0 || Boolean(shown.q) || shown.status !== "all"}
                    onRemove={(key) => go(chips.find((chip) => chip.key === key)!.patch)} />}
            />
            <Results aria-busy={isPending || undefined}>{children}</Results>
        </>
    );
}

const Results = styled.div`
    transition: opacity 150ms ease;
    &[aria-busy="true"] { opacity: 0.45; pointer-events: none; }
    @media (prefers-reduced-motion: reduce) { transition: none; }
`;
