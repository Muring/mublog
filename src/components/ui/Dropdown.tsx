"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { DropdownRoot, DropdownButton, DropdownList } from "./Dropdown.styled";

export type DropdownOption = { value: string; label: string };

type Props = {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    /** 스크린리더용 이름. 화면에 라벨이 따로 없을 때 반드시 준다. */
    label: string;
    size?: "sm" | "md";
    /** 목록을 버튼의 어느 쪽에 맞출지. 오른쪽 끝에 놓인 버튼은 right. */
    align?: "left" | "right";
    /** 자리는 지키고 보이지만 않게 한다. */
    hidden?: boolean;
    className?: string;
};

/**
 * 공용 드롭다운.
 *
 * 네이티브 select 는 펼쳐진 목록에 스타일이 닿지 않는다. 버튼 + listbox 로 그리고
 * 키보드(화살표·Home·End·Enter·Escape)와 바깥 클릭을 처리한다.
 * 포트폴리오 화면 종류, 에디터 시리즈, 방문자 차트 연도가 같이 쓴다.
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
}: Props) {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(0);
    const root = useRef<HTMLDivElement>(null);
    const listId = useId();
    const current = options.find((option) => option.value === value) ?? options[0];

    useEffect(() => {
        if (!open) return;
        const close = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, [open]);

    function openList() {
        setFocused(Math.max(0, options.findIndex((option) => option.value === value)));
        setOpen(true);
    }

    function choose(index: number) {
        const option = options[index];
        if (option && option.value !== value) onChange(option.value);
        setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
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
                setFocused((i) => Math.min(options.length - 1, i + 1));
                break;
            case "ArrowUp":
                event.preventDefault();
                setFocused((i) => Math.max(0, i - 1));
                break;
            case "Home":
                event.preventDefault();
                setFocused(0);
                break;
            case "End":
                event.preventDefault();
                setFocused(options.length - 1);
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                choose(focused);
                break;
            case "Escape":
            case "Tab":
                setOpen(false);
                break;
        }
    }

    return (
        <DropdownRoot ref={root} className={className} data-hidden={hidden} onKeyDown={onKeyDown}>
            <DropdownButton
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
            {open && (
                <DropdownList id={listId} role="listbox" aria-label={label} $align={align}>
                    {options.map((option, index) => (
                        <li
                            key={option.value}
                            role="option"
                            aria-selected={option.value === value}
                            data-focused={index === focused}
                            onPointerEnter={() => setFocused(index)}
                            onClick={() => choose(index)}
                        >
                            {option.label}
                        </li>
                    ))}
                </DropdownList>
            )}
        </DropdownRoot>
    );
}
