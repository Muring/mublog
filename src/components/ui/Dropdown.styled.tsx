"use client";

import styled from "@emotion/styled";
import { surface } from "@/styles/surface";

export const DropdownRoot = styled.div`
    position: relative;
    display: inline-block;

    &[data-hidden="true"] {
        /* 자리는 남기고 탭 순서에서는 뺀다 (VisitorChart 의 연도 선택) */
        visibility: hidden;
    }
`;

export const DropdownButton = styled.button<{ $size: "sm" | "md" | "control" }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    ${surface("0.4rem")}
    color: var(--foreground);
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    background-clip: padding-box;
    box-shadow: none;
    /* outline 은 none ↔ solid 사이를 못 넘어간다(style 은 이산값). 늘 투명한 링을 깔아두고 색만 바꾼다 */
    outline: 1px solid transparent;
    outline-offset: calc(-1 * var(--border-width));
    transition: color 0.15s ease, background-color 0.15s ease, border-color 150ms ease, outline-color 0.15s ease;

    ${({ $size }) =>
        $size === "control"
            ? `box-sizing: border-box; height: 38px; padding: 0 30px 0 12px; border-radius: 8px; background: var(--background); font-size: 13px;`
            : $size === "sm"
            ? `padding: 0.25rem 1.6rem 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 700;`
            : `padding: 0.55rem 2rem 0.55rem 0.75rem; font-size: 0.875rem;`}

    > span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /*
     * 호버는 포커스 링과 같은 outline 으로 알린다. 테두리 색을 바꾸면 1px 선이 무거워져 옆의
     * 세그먼트(테두리 없음)와 무게가 갈리고, --hovercolor 는 다크에서 면이 확 밝아져 컨트롤 하나에는 과하다.
     * 면은 펼친 목록의 항목 호버와 같은 8% 섞기만 얹는다.
     */
    &:hover,
    &[aria-expanded="true"] {
        border-color: transparent;
        outline-color: var(--foreground);
        background-color: color-mix(in srgb, var(--foreground) 8%, var(--background));
        color: var(--foreground);
    }
    &:focus-visible {
        outline: 2px solid var(--linkhovercolor);
        outline-offset: 2px;
    }

    /* 셰브런. 이미지 대신 테두리 두 변을 돌려 그려서 currentColor 로 테마를 따라간다. */
    &::after {
        content: "";
        position: absolute;
        right: ${({ $size }) => ($size === "sm" ? "0.55rem" : "0.8rem")};
        top: 50%;
        width: 6px;
        height: 6px;
        border-right: 1.5px solid currentColor;
        border-bottom: 1.5px solid currentColor;
        transform: translateY(-70%) rotate(45deg);
        transition: transform 0.15s ease;
    }
    &[aria-expanded="true"]::after {
        transform: translateY(-20%) rotate(225deg);
    }
`;

export const DropdownList = styled.ul<{ $align: "left" | "right" }>`
    position: absolute;
    top: calc(100% + 6px);
    ${({ $align }) => ($align === "right" ? "right: 0;" : "left: 0;")}
    z-index: 20;
    min-width: 100%;
    max-height: 320px;
    overflow-y: auto;
    margin: 0;
    padding: 6px;
    list-style: none;
    ${surface("0.4rem")}
    box-shadow: 0 8px 24px var(--shadowcolor);
    font-size: 0.875rem;
    font-weight: 400;
    white-space: nowrap;

    li {
        position: relative;
        padding: 0.5rem 1.75rem 0.5rem 0.75rem;
        border-radius: 4px;
        color: var(--foreground);
        cursor: pointer;
    }
    li[data-focused="true"], li:hover {
        background-color: color-mix(in srgb, var(--foreground) 8%, var(--cardbackground));
        color: var(--foreground);
    }
    li[aria-selected="true"] {
        background-color: transparent;
        color: var(--foreground);
        font-weight: 700;
    }
    li[aria-selected="true"]:hover {
        background-color: color-mix(in srgb, var(--foreground) 8%, var(--cardbackground));
    }
    li[aria-selected="true"]::after {
        content: "";
        position: absolute;
        right: 0.75rem;
        top: 50%;
        width: 5px;
        height: 9px;
        border-right: 1.5px solid currentColor;
        border-bottom: 1.5px solid currentColor;
        transform: translateY(-60%) rotate(45deg);
    }
`;
