"use client";

import { useEffect, useOptimistic, useRef, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import Dropdown from "@/components/ui/Dropdown";
import { COMMENT_QUERY_MAX, commentListUrl, type CommentSort } from "@/lib/admin-navigation";
import { adminDateLabel } from "@/lib/admin-filters";
import FilterBar from "./FilterBar";
import FilterChips from "./FilterChips";
import { splitMulti, withoutMulti } from "@/lib/multi-value";
import { useImeInput } from "@/hooks/useImeInput";

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
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    // 다듬은(trim) 검색어가 되돌아오므로 치는 도중의 입력창은 덮지 않는다
    const { composing, inputRef, clear: clearSearch, inputProps: searchInput } = useImeInput(q, schedule, { syncWhileFocused: false });
    // 같은 프레임에 여러 조작이 들어와도 직전 선택을 잃지 않는다.
    const latest = useRef(shown);
    useEffect(() => { latest.current = shown; }, [shown]);
    // 조건을 바꿔도 뒤로 가기 기록을 쌓지 않는다. 뒤로 가기는 관리 화면을 떠난다(lib/admin-navigation, 다른 목록과 같은 규칙)
    const go = (patch: Partial<Filter>) => {
        clearTimeout(timer.current);
        const next = { ...latest.current, q: composing.current ? latest.current.q : (inputRef.current?.value.trim() ?? latest.current.q), ...patch };
        latest.current = next;
        startTransition(() => {
            choose(next);
            const url = commentListUrl({ ...next, returnTo, page: 1 });
            router.replace(url, { scroll: false });
        });
    };
    useEffect(() => () => clearTimeout(timer.current), []);
    // 입력창 훅이 먼저 불려 이 함수를 받으므로 끌어올려지는 선언으로 둔다
    function schedule() {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (!composing.current && inputRef.current?.value.trim() !== latest.current.q) go({});
        }, SEARCH_DELAY);
    }
    const reset = () => {
        clearSearch();
        go({ post: undefined, author: undefined, q: "", from: "", to: "", status: "all" });
    };
    const chips: { key: string; name: string; value: string; patch: Partial<Filter> }[] = [
        ...(shown.status !== "all" ? [{ key: "status", name: "상태", value: shown.status === "live" ? "게시 중" : "삭제됨", patch: { status: "all" as const } }] : []),
        // 여러 개를 골랐으면 값마다 칩을 하나씩 두어 하나씩 풀 수 있게 한다
        ...splitMulti(shown.post).map((slug) => ({ key: `post:${slug}`, name: "글", value: options.posts.find((p) => p.slug === slug)?.title ?? slug, patch: { post: withoutMulti(shown.post, slug) || undefined } })),
        ...splitMulti(shown.author).map((id) => ({ key: `author:${id}`, name: "작성자", value: options.authors.find((a) => a.id === id)?.username ?? id, patch: { author: withoutMulti(shown.author, id) || undefined } })),
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
                search={<input type="search" {...searchInput} maxLength={COMMENT_QUERY_MAX}
                    onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) go({}); }}
                    placeholder="댓글 본문 검색" aria-label="댓글 본문 검색" />}
                fields={[
                    { key: "post", label: "글", search: "글 제목 검색", multiple: true, options: [{ value: "", label: "전체" }, ...options.posts.map((p) => ({ value: p.slug, label: p.title, hint: String(p.count) }))] },
                    { key: "author", label: "작성자", search: "이름 검색", multiple: true, options: [{ value: "", label: "전체" }, ...options.authors.map((a) => ({ value: a.id, label: a.username, hint: String(a.count) }))] },
                ]}
                values={{ post: shown.post ?? "", author: shown.author ?? "", from: shown.from, to: shown.to }}
                dateRange
                onApply={(next) => go({ post: next.post || undefined, author: next.author || undefined, from: next.from, to: next.to })}
                fieldCount={new Set(chips.filter((chip) => chip.key !== "status").map((chip) => chip.key.split(":")[0])).size}
                summary={summary}
                pending={isPending}
                searchActive={Boolean(shown.q)}
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
