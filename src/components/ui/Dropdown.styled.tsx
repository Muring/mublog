"use client";

import styled from "@emotion/styled";
import { surface, hoverSurface } from "@/styles/surface";

export const DropdownRoot = styled.div`
    position: relative;
    display: inline-block;

    &[data-hidden="true"] {
        /* 자리는 남기고 탭 순서에서는 뺀다 (VisitorChart 의 연도 선택) */
        visibility: hidden;
    }
`;

export const DropdownButton = styled.button<{ $size: "sm" | "md" }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    ${surface("0.4rem")}
    color: var(--foreground);
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;

    ${({ $size }) =>
        $size === "sm"
            ? `padding: 0.25rem 1.6rem 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 700;`
            : `padding: 0.55rem 2rem 0.55rem 0.75rem; font-size: 0.875rem;`}

    > span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &:hover,
    &[aria-expanded="true"] {
        border-color: var(--linkhovercolor);
        color: var(--linkhovercolor);
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
    /* 호버 면은 두 테마 모두 밝은 회색이라 글자도 어두운 값을 같이 준다. */
    li[data-focused="true"] {
        ${hoverSurface}
    }
    li[aria-selected="true"] {
        color: var(--linkhovercolor);
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
