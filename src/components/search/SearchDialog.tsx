"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchSearch, queryKeys } from "@/lib/queries";
import { formatPostDate } from "@/lib/date";
import { SearchOverlay, SearchPanel } from "./Search.styled";
import SearchIcon from "./SearchIcon";
import Highlight from "./Highlight";

const DEBOUNCE_MS = 250;
const MIN_LENGTH = 2;

/**
 * 검색 창. 헤더 버튼이나 Ctrl/⌘+K 로 연다.
 *
 * 입력은 즉시 반영하고 요청은 250ms 뒤에 보낸다. 같은 검색어는 TanStack Query 가
 * 기억하므로 지웠다 다시 쳐도 요청이 다시 가지 않는다.
 */
export default function SearchDialog({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(0);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const composing = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    // 목록을 따라 스크롤하는 건 키보드로 옮길 때만이다. 마우스가 위아래 끝에 걸친 항목에
    // 닿을 때마다 목록이 움직이면 내용이 손 밑에서 미끄러진다.
    const viaKeyboard = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(input.trim());
            setFocused(0); // 검색어가 바뀌면 첫 결과부터
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [input]);

    const enabled = query.length >= MIN_LENGTH;
    const { data, isFetching, error } = useQuery({
        queryKey: queryKeys.search(query),
        queryFn: () => fetchSearch(query),
        enabled,
        staleTime: 5 * 60 * 1000,
    });
    const currentResults = input.trim() === query;
    const hits = enabled && currentResults ? (data ?? []) : [];
    const terms = query.split(/\s+/).filter(Boolean);

    useEffect(() => {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const dialog = dialogRef.current;
        dialog?.showModal();
        inputRef.current?.focus();
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            dialog?.close();
            document.body.style.overflow = previous;
            if (opener?.isConnected) opener.focus();
        };
    }, []);

    useEffect(() => {
        if (!viaKeyboard.current) return;
        viaKeyboard.current = false;
        const item = listRef.current?.children[focused] as HTMLElement | undefined;
        item?.scrollIntoView({ block: "nearest" });
    }, [focused]);

    function go(slug: string) {
        onClose();
        router.push(`/${slug}`);
    }

    function onKeyDown(event: KeyboardEvent) {
        if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
        if (event.key === "Tab") {
            const items = dialogRef.current?.querySelectorAll<HTMLElement>('input, a[href], button:not(:disabled)');
            const first = items?.[0];
            const last = items?.[items.length - 1];
            if (first && last && event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (first && last && !event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
            return;
        }
        if (event.target !== inputRef.current) return;
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                viaKeyboard.current = true;
                setFocused((i) => Math.max(0, Math.min(hits.length - 1, i + 1)));
                break;
            case "ArrowUp":
                event.preventDefault();
                viaKeyboard.current = true;
                setFocused((i) => Math.max(0, i - 1));
                break;
            case "Enter":
                event.preventDefault();
                if (hits[focused]) go(hits[focused].slug);
                break;
        }
    }

    let status: string | null = null;
    if (!enabled) status = input.trim().length > 0 ? "두 글자 이상 입력하세요." : "제목·요약·본문에서 찾습니다.";
    else if (error) status = error instanceof Error ? error.message : "검색에 실패했습니다.";
    else if (!currentResults || (isFetching && !data)) status = "찾는 중…";
    else if (hits.length === 0) status = `"${query}" 에 맞는 글이 없습니다.`;

    return (
        <SearchOverlay
            ref={dialogRef}
            aria-label="글 검색"
            onCancel={(event) => {
                event.preventDefault();
                if (!composing.current) onClose();
            }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
        >
            <SearchPanel
                onClick={(event) => event.stopPropagation()}
                onKeyDown={onKeyDown}
            >
                <div className="search-input-row">
                    <SearchIcon size={18} />
                    <input
                        ref={inputRef}
                        value={input}
                        onCompositionStart={() => { composing.current = true; }}
                        onCompositionEnd={() => { composing.current = false; }}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="검색어를 입력하세요"
                        aria-label="검색어"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <kbd>ESC</kbd>
                </div>
                {status ? (
                    <p className="search-status">{status}</p>
                ) : (
                    <ul className="search-results" ref={listRef} aria-label="검색 결과">
                        {hits.map((hit, index) => (
                            <li
                                key={hit.slug}
                                className="search-hit"
                                data-focused={index === focused}
                                onPointerEnter={() => setFocused(index)}
                            >
                                <a
                                    href={`/${hit.slug}`}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        go(hit.slug);
                                    }}
                                >
                                    <span className="hit-title" style={{ display: "block" }}>
                                        <Highlight text={hit.title} terms={terms} />
                                    </span>
                                    {(hit.snippet ?? hit.description) && (
                                        <span className="hit-snippet">
                                            <Highlight text={hit.snippet ?? hit.description ?? ""} terms={terms} />
                                        </span>
                                    )}
                                    <span className="hit-meta">
                                        <span>{formatPostDate(hit.publishedAt)}</span>
                                        {hit.tags.map((tag) => (
                                            <span key={tag}>{tag}</span>
                                        ))}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </SearchPanel>
        </SearchOverlay>
    );
}
