"use client";

import { useEffect, useOptimistic, useRef, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import Dropdown from "@/components/ui/Dropdown";
import { COMMENT_QUERY_MAX, commentDate, commentListUrl, type CommentSort } from "@/lib/admin-navigation";
import { TableToolbar } from "./Admin.styled";

type Status = "all" | "live" | "deleted";
type Filter = { post?: string; author?: string; q: string; from: string; to: string; status: Status; sort: CommentSort };
type Props = Filter & {
    counts: Record<Status, number>;
    returnTo: string;
    /** 최근 댓글이 달린 순서. count 는 삭제 포함 */
    options: { posts: { slug: string; title: string; count: number }[]; authors: { id: string; username: string; count: number }[] };
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
 *
 * 글·작성자 드롭다운은 검색형이다. 둘 다 댓글이 쌓일수록 길어져서 스크롤로 찾을 수 없게 된다.
 *
 * 본문 검색과 작성일은 "입력하는" 조건이라 둘째 줄에 모은다. 칠 때마다 서버 왕복이라 멈춘 뒤에 한 번 보내고,
 * 기록은 쌓지 않는다(replace). 한글 조합 중에는 보내지 않는다(AGENTS §2).
 * 날짜도 같은 지연을 탄다 — 연도를 키보드로 치면 0002 → 0020 → 0202 → 2026 마다 change 가 나기 때문이다.
 * 끝 날짜가 시작 날짜보다 앞서면 적용하지 않고 방금 고친 칸에 안내를 띄운다(사용자 결정, 2026-09-28).
 * 몰래 뒤집어 적용하면 치고 있던 칸은 입력 중이라 갱신되지 않아 칩·목록과 입력칸이 서로 다른 범위를 보였다.
 *
 * 걸린 조건은 아래에 칩으로 늘어놓는다. 드롭다운 버튼만으로는 무엇이 걸려 있는지 한눈에 안 들어오고,
 * 칩을 누르면 그 조건 하나만 풀 수 있다.
 */
/** 입력을 멈추고 이만큼 지나면 보낸다. 한글은 조합이 끝나야 보내므로 짧게 잡아도 음절 중간에 가지 않는다 */
const SEARCH_DELAY = 200;
const YEAR_MAX = "9999-12-31";

export default function CommentFilters({ post, author, q, from, to, status, sort, counts, returnTo, options, children }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [shown, choose] = useOptimistic<Filter, Partial<Filter>>({ post, author, q, from, to, status, sort }, (current, patch) => ({ ...current, ...patch }));
    const queryInput = useRef<HTMLInputElement>(null);
    const fromInput = useRef<HTMLInputElement>(null);
    const toInput = useRef<HTMLInputElement>(null);
    const composing = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    /** 입력칸에 쳐 두고 아직 안 보낸 값. 다른 조건을 고를 때 같이 싣는다. 날짜가 거꾸로면 그 날짜는 싣지 않고 걸려 있던 값을 둔다 */
    const typed = () => {
        const dates = { from: commentDate(fromInput.current?.value ?? shown.from), to: commentDate(toInput.current?.value ?? shown.to) };
        return {
            q: queryInput.current?.value.trim() ?? shown.q,
            ...(reversed(dates) ? { from: shown.from, to: shown.to } : dates),
        };
    };
    /** 방금 고친 날짜 칸에 순서 오류를 알린다. 다른 쪽 칸에 남은 옛 안내는 지운다 */
    const checkDates = (edited: "from" | "to") => {
        const from = fromInput.current, to = toInput.current;
        if (!from || !to) return;
        from.setCustomValidity("");
        to.setCustomValidity("");
        if (!reversed({ from: commentDate(from.value), to: commentDate(to.value) })) return;
        const target = edited === "from" ? from : to;
        target.setCustomValidity(edited === "from" ? "종료일 이전으로 선택해 주세요." : "시작일 이후로 선택해 주세요.");
        target.reportValidity();
    };
    const go = (patch: Partial<Filter>, replace = false) => startTransition(() => {
        clearTimeout(timer.current);
        const next = { ...shown, ...typed(), ...patch };
        choose(next);
        const url = commentListUrl({ ...next, returnTo, page: 1 });
        if (replace) router.replace(url);
        else router.push(url);
    });

    // 초기화·칩·뒤로 가기로 URL 의 값이 바뀌면 입력칸을 따라 맞춘다. 치고 있는 칸은 건드리지 않는다
    useEffect(() => {
        for (const [input, value] of [[queryInput, q], [fromInput, from], [toInput, to]] as const) {
            if (input.current && document.activeElement !== input.current && !(input === queryInput && composing.current)) input.current.value = value;
        }
    }, [q, from, to]);
    useEffect(() => () => clearTimeout(timer.current), []);
    const schedule = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            const next = typed();
            if (next.q !== shown.q || next.from !== shown.from || next.to !== shown.to) go(next, true);
        }, SEARCH_DELAY);
    };

    const reset = () => release({ post: undefined, author: undefined, q: "", from: "", to: "", status: "all", sort: "newest" });
    const pristine = shown.status === "all" && !shown.post && !shown.author && !shown.q && !shown.from && !shown.to && shown.sort === "newest";

    const chips: { key: string; name: string; value: string; patch: Partial<Filter> }[] = [
        ...(shown.status !== "all" ? [{ key: "status", name: "상태", value: shown.status === "live" ? "게시 중" : "삭제됨", patch: { status: "all" as const } }] : []),
        ...(shown.post ? [{ key: "post", name: "글", value: options.posts.find((p) => p.slug === shown.post)?.title ?? shown.post, patch: { post: undefined } }] : []),
        ...(shown.author ? [{ key: "author", name: "작성자", value: options.authors.find((a) => a.id === shown.author)?.username ?? shown.author, patch: { author: undefined } }] : []),
        ...(shown.q ? [{ key: "q", name: "본문", value: shown.q, patch: { q: "" } }] : []),
        ...(shown.from || shown.to ? [{ key: "date", name: "작성일", value: dateRangeLabel(shown.from, shown.to), patch: { from: "", to: "" } }] : []),
    ];
    // 칩으로 푼 칸은 포커스가 없으니 effect 가 맞춰 주지만, 그 전에 typed() 가 옛 값을 다시 싣지 않게 먼저 비운다
    const release = (patch: Partial<Filter>) => {
        if ("q" in patch && queryInput.current) queryInput.current.value = "";
        if ("from" in patch && fromInput.current) { fromInput.current.value = ""; fromInput.current.setCustomValidity(""); }
        if ("to" in patch && toInput.current) { toInput.current.value = ""; toInput.current.setCustomValidity(""); }
        go(patch);
    };

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
            <Dropdown className="post-filter" label="글 필터" size="control" value={shown.post ?? ""} searchable="글 제목 검색"
                options={[{ value: "", label: "모든 글" }, ...options.posts.map((p) => ({ value: p.slug, label: p.title, hint: String(p.count) }))]}
                onChange={(value) => go({ post: value || undefined })} />
            <Dropdown label="작성자 필터" size="control" value={shown.author ?? ""} searchable="이름 검색"
                options={[{ value: "", label: "모든 작성자" }, ...options.authors.map((a) => ({ value: a.id, label: a.username, hint: String(a.count) }))]}
                onChange={(value) => go({ author: value || undefined })} />
            <Dropdown label="댓글 정렬" size="control" value={shown.sort} align="right"
                options={[{ value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" }]}
                onChange={(value) => go({ sort: value as CommentSort })} />
            <button type="button" disabled={pristine} onClick={reset}>초기화</button>
        </TableToolbar>
        <TableToolbar className="comment-search">
            <input type="search" ref={queryInput} defaultValue={q} maxLength={COMMENT_QUERY_MAX}
                onCompositionStart={() => { composing.current = true; }}
                onCompositionEnd={() => { composing.current = false; schedule(); }}
                onChange={() => { if (!composing.current) schedule(); }}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) go({}, true); }}
                placeholder="댓글 본문 검색" aria-label="댓글 본문 검색" />
            {/* 라벨 글자는 표시용이다. 날짜 칸마다 aria-label 을 따로 둬서 "작성일 시작/끝" 으로 읽힌다 */}
            <span className="date-label">작성일 <small>(한국 시간)</small></span>
            {/* max 가 없으면 Chrome 은 연도 칸에 여섯 자리(최대 275760)까지 받는다. 늘 네 자리 상한을 걸어 둔다 */}
            <input type="date" ref={fromInput} defaultValue={from} max={shown.to || YEAR_MAX} aria-label="작성일 시작" onChange={() => { checkDates("from"); schedule(); }} />
            <span className="date-sep" aria-hidden="true">~</span>
            <input type="date" ref={toInput} defaultValue={to} min={shown.from || undefined} max={YEAR_MAX} aria-label="작성일 끝" onChange={() => { checkDates("to"); schedule(); }} />
        </TableToolbar>
        {chips.length > 0 && (
            <Chips aria-label="적용된 필터">
                {chips.map((chip) => (
                    <li key={chip.key}>
                        <button type="button" onClick={() => release(chip.patch)} title={`${chip.name}: ${chip.value}`} aria-label={`${chip.name} ${chip.value} 필터 해제`}>
                            <span className="chip-name">{chip.name}</span>
                            <span className="chip-value">{chip.value}</span>
                            <span className="chip-x" aria-hidden="true" />
                        </button>
                    </li>
                ))}
            </Chips>
        )}
        <Results aria-busy={isPending || undefined}>{children}</Results>
        </>
    );
}

function reversed({ from, to }: { from: string; to: string }) {
    return Boolean(from && to && from > to);
}

/** 2026-09-28 → 2026.09.28 */
function dot(date: string) {
    return date.replaceAll("-", ".");
}
/** 한쪽만 걸었으면 "이후"/"이전" 으로 읽히게 한다. "2026.09.10 ~" 처럼 끝이 비면 덜 쓴 것처럼 보인다 */
function dateRangeLabel(from: string, to: string) {
    if (from && to) return `${dot(from)} ~ ${dot(to)}`;
    return from ? `${dot(from)} 이후` : `${dot(to)} 이전`;
}

/*
 * 적용된 필터 칩.
 * 색은 태그 칩(ui/TagChips)과 같은 짝이다 — 바탕 --codefontbgcolor, 글자 --foreground 로 양 테마 모두 AA 를 넉넉히 넘는다.
 * (--activecolor 를 바탕에 쓰면 라이트는 검정, 다크는 밝은 회색이라 --foreground 글자가 바탕에 묻힌다.)
 * 누를 수 있으므로 호버를 둔다. 툴바 컨트롤과 같은 outline + 8% 섞기라 한 화면에서 호버 표현이 갈리지 않는다.
 * 칩 모양이 이미 필터임을 말하므로 이름은 흐리게, 값은 진하게 둔다.
 */
const Chips = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0 0 4px;
    padding: 0;
    list-style: none;

    li { min-width: 0; max-width: 100%; }
    button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 4px 8px 4px 10px;
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 999px;
        background: var(--codefontbgcolor);
        color: var(--foreground);
        font: inherit;
        font-size: 12px;
        line-height: 1.5;
        cursor: pointer;
        outline: 1px solid transparent;
        outline-offset: calc(-1 * var(--border-width));
        transition: background-color .15s, color .15s, border-color 150ms ease, outline-color .15s;
    }
    button:hover {
        border-color: transparent;
        outline-color: var(--foreground);
        background: color-mix(in srgb, var(--foreground) 8%, var(--codefontbgcolor));
        color: var(--foreground);
    }
    button:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    .chip-name { flex-shrink: 0; color: var(--desccolor); }
    .chip-value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; }
    /* × 는 글꼴마다 굵기·높이가 달라 두 선을 돌려 그린다. currentColor 라 테마를 따라간다 */
    .chip-x { position: relative; flex-shrink: 0; width: 10px; height: 10px; }
    .chip-x::before, .chip-x::after { content: ""; position: absolute; left: 50%; top: 50%; width: 10px; height: 1.5px; border-radius: 1px; background: currentColor; }
    .chip-x::before { transform: translate(-50%, -50%) rotate(45deg); }
    .chip-x::after { transform: translate(-50%, -50%) rotate(-45deg); }
`;

/* 결과가 바뀌는 중임을 목록 전체로 알린다. 잠깐이라 opacity 로 충분하다 — 대비를 낮추는 게 아니라 "지금은 옛 결과" 라는 표시다 */
const Results = styled.div`
    transition: opacity .15s;
    &[aria-busy="true"] { opacity: .5; pointer-events: none; }
`;
