"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { DropdownRoot, DropdownButton, DropdownList, DropdownPanel } from "./Dropdown.styled";

/** hint 는 항목 오른쪽에 흐리게 붙는 보조 정보(개수 등). 검색 대상이 아니고 버튼에도 안 나온다 */
export type DropdownOption = { value: string; label: string; hint?: string };

type Props = {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    /** 스크린리더용 이름. 화면에 라벨이 따로 없을 때 반드시 준다. */
    label: string;
    size?: "sm" | "md" | "control";
    /** 목록을 버튼의 어느 쪽에 맞출지. 오른쪽 끝에 놓인 버튼은 right. */
    align?: "left" | "right";
    /** 자리는 지키고 보이지만 않게 한다. */
    hidden?: boolean;
    className?: string;
    /**
     * 항목이 많아 스크롤로 찾기 힘든 목록에 검색창을 단다. 값은 검색창의 placeholder.
     * 첫 항목("전체" 같은 초기화 선택지)은 검색해도 늘 남긴다.
     */
    searchable?: string;
};

/**
 * 공용 드롭다운.
 *
 * 네이티브 select 는 펼쳐진 목록에 스타일이 닿지 않는다. 버튼 + listbox 로 그리고
 * 키보드(화살표·Home·End·Enter·Escape)와 바깥 클릭을 처리한다.
 * 포트폴리오 화면 종류, 에디터 시리즈, 방문자 차트 연도가 같이 쓴다.
 *
 * searchable 이면 펼칠 때 검색창에 포커스가 가고, 화살표·Enter 는 검색창에서 그대로 목록을 움직인다.
 * 한글은 조합이 끝났을 때만 거른다 — 조합 중에 상태를 바꾸면 자모가 풀린다(AGENTS §2).
 * 조합 중의 Enter(isComposing)는 글자 확정이지 선택이 아니라서 무시한다.
 */
export default function Dropdown({
    value,
    options,
    onChange,
    label,
    size = "md",
    align = "left",
    hidden = false,
    className,
    searchable,
}: Props) {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(0);
    const [query, setQuery] = useState("");
    const composing = useRef(false);
    const root = useRef<HTMLDivElement>(null);
    const button = useRef<HTMLButtonElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const listId = useId();
    const current = options.find((option) => option.value === value) ?? options[0];
    const needle = query.trim().toLowerCase();
    const shown = needle ? options.filter((option, index) => index === 0 || option.label.toLowerCase().includes(needle)) : options;

    useEffect(() => {
        if (!open) return;
        const close = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, [open]);

    // 키보드로 움직인 항목이 스크롤 밖에 있으면 따라간다. 항목이 많은 검색형에서만 실제로 필요하다.
    useEffect(() => {
        if (open) list.current?.querySelector<HTMLElement>(`[data-index="${focused}"]`)?.scrollIntoView({ block: "nearest" });
    }, [open, focused]);

    function openList() {
        setQuery("");
        setFocused(Math.max(0, options.findIndex((option) => option.value === value)));
        setOpen(true);
    }

    function close() {
        setOpen(false);
        // 검색창이 사라지면 포커스가 body 로 떨어진다. 버튼으로 돌려놔야 Tab 순서가 이어진다.
        if (searchable) button.current?.focus();
    }

    function choose(index: number) {
        const option = shown[index];
        if (!option) return;
        if (option.value !== value) onChange(option.value);
        close();
    }

    function search(text: string) {
        setQuery(text);
        setFocused(0);
    }

    function onKeyDown(event: KeyboardEvent) {
        if (event.nativeEvent.isComposing) return;
        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                openList();
            }
            return;
        }
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setFocused((i) => Math.min(shown.length - 1, i + 1));
                break;
            case "ArrowUp":
                event.preventDefault();
                setFocused((i) => Math.max(0, i - 1));
                break;
            case "Home":
                // 검색창에서는 커서 이동이다
                if (searchable) break;
                event.preventDefault();
                setFocused(0);
                break;
            case "End":
                if (searchable) break;
                event.preventDefault();
                setFocused(shown.length - 1);
                break;
            case " ":
                // 검색창에서는 띄어쓰기다
                if (searchable) break;
                event.preventDefault();
                choose(focused);
                break;
            case "Enter":
                event.preventDefault();
                choose(focused);
                break;
            case "Escape":
                close();
                break;
            case "Tab":
                setOpen(false);
                break;
        }
    }

    const items = (
        <DropdownList ref={list} id={listId} role="listbox" aria-label={label} $align={align} $inPanel={Boolean(searchable)}>
            {shown.map((option, index) => (
                <li
                    key={option.value}
                    id={`${listId}-${index}`}
                    role="option"
                    data-index={index}
                    aria-selected={option.value === value}
                    data-focused={index === focused}
                    onPointerEnter={() => setFocused(index)}
                    onClick={() => choose(index)}
                >
                    <span className="option-label">{option.label}</span>
                    {option.hint && <span className="option-hint">{option.hint}</span>}
                </li>
            ))}
            {shown.length === 1 && needle && <li className="empty" role="option" aria-selected="false" aria-disabled="true">일치하는 항목이 없습니다</li>}
        </DropdownList>
    );

    return (
        <DropdownRoot ref={root} className={className} data-hidden={hidden} onKeyDown={onKeyDown}>
            <DropdownButton
                ref={button}
                type="button"
                $size={size}
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => (open ? setOpen(false) : openList())}
            >
                <span>{current?.label}</span>
            </DropdownButton>
            {open && (searchable ? (
                <DropdownPanel $align={align}>
                    <input
                        type="search"
                        className="dropdown-search"
                        placeholder={searchable}
                        aria-label={`${label} 검색`}
                        role="combobox"
                        aria-expanded="true"
                        aria-controls={listId}
                        aria-activedescendant={shown.length ? `${listId}-${focused}` : undefined}
                        autoFocus
                        onCompositionStart={() => { composing.current = true; }}
                        onCompositionEnd={(event) => { composing.current = false; search(event.currentTarget.value); }}
                        onChange={(event) => { if (!composing.current) search(event.currentTarget.value); }}
                    />
                    {items}
                </DropdownPanel>
            ) : items)}
        </DropdownRoot>
    );
}
