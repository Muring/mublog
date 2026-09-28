"use client";

import styled from "@emotion/styled";
import { surface } from "@/styles/surface";
import { thinScrollbar } from "@/styles/scrollbar";

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

/* 펼친 목록의 바탕. 검색형은 이 판 위에 검색창과 목록을 함께 얹고, 목록 자체는 판 안에 흐르게 둔다 */
const popup = (align: "left" | "right") => `
    position: absolute;
    top: calc(100% + 6px);
    ${align === "right" ? "right: 0;" : "left: 0;"}
    z-index: 20;
    min-width: 100%;
`;

export const DropdownPanel = styled.div<{ $align: "left" | "right" }>`
    ${({ $align }) => popup($align)}
    ${surface("0.4rem")}
    box-shadow: 0 8px 24px var(--shadowcolor);
    /* 글 제목처럼 긴 항목이 화면 밖으로 밀어내지 않게 폭을 묶고, 항목은 말줄임한다 */
    width: max-content;
    max-width: min(32rem, calc(100vw - 32px));
    padding: 6px;

    .dropdown-search {
        box-sizing: border-box;
        width: 100%;
        height: 34px;
        margin-bottom: 4px;
        padding: 0 10px;
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 6px;
        background: var(--background);
        color: var(--foreground);
        font: inherit;
        font-size: 13px;
    }
    .dropdown-search:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: -1px; }
`;

export const DropdownList = styled.ul<{ $align: "left" | "right"; $inPanel?: boolean }>`
    ${({ $align, $inPanel }) => ($inPanel ? "" : popup($align))}
    max-height: ${({ $inPanel }) => ($inPanel ? "280px" : "320px")};
    overflow-y: auto;
    /* 항목이 많으면(태그·글 목록) 스크롤이 생긴다. 관리 목록과 같은 막대를 쓰고, 막대 둘레는 목록 바탕(카드색)으로 깎는다 */
    ${thinScrollbar("var(--cardbackground)")}
    margin: 0;
    padding: ${({ $inPanel }) => ($inPanel ? "0" : "6px")};
    list-style: none;
    ${({ $inPanel }) => ($inPanel ? "" : surface("0.4rem"))}
    ${({ $inPanel }) => ($inPanel ? "" : "box-shadow: 0 8px 24px var(--shadowcolor);")}
    font-size: 0.875rem;
    font-weight: 400;
    white-space: nowrap;

    li {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0.5rem 1.75rem 0.5rem 0.75rem;
        border-radius: 4px;
        color: var(--foreground);
        cursor: pointer;
    }
    .option-label { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    /*
     * 개수 같은 보조 정보. 이름 바로 뒤에 알약 배지로 붙인다(사용자 결정, 2026-09-28) —
     * 오른쪽 끝에 맨 숫자로 두면 넓은 목록에서 이름과 떨어져 허공에 뜬다.
     * 바탕은 고정 토큰이 아니라 전경색을 얇게 깐다. --codefontbgcolor 는 다크 호버 면(카드 + 8%)과
     * 거의 같은 색이라 호버하면 배지가 사라진다. 글자는 --foreground 라 어느 면 위에서도 대비가 충분하다.
     */
    .option-hint {
        flex-shrink: 0;
        padding: 0 6px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--foreground) 12%, transparent);
        color: var(--foreground);
        font-size: 11px;
        font-weight: 600;
        line-height: 1.6;
        font-variant-numeric: tabular-nums;
    }
    li.empty { color: var(--desccolor); cursor: default; }
    li[data-focused="true"], li:not(.empty):hover {
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
