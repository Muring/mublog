"use client";

import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";

/*
 * 관리 화면(블로그 관리·AI 관리) 공통 머리줄. 제목 · 밑줄 탭 · 동작 버튼이 한 줄이고, 밑줄은 줄 전체에 긋는다.
 * 탭은 밑줄에 붙어야 하므로 모두 줄 아래쪽에 맞춘다. 제목은 아래 여백으로 글자 기준선을 탭 글자와 맞추고(실측: 제목 8px · 탭 16px),
 * 버튼(38px)은 세로 가운데를 제목 글자 가운데에 맞춘다(실측: 둘 다 밑줄 위 23.5px). 탭 상자에 맞추면 밑줄에 붙어 보이고,
 * 더 띄우면 제목보다 떠 보인다
 */
export const HeadingRoot = styled.header`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: end;
    column-gap: 1.25rem;
    flex-shrink: 0;
    min-width: 0;
    border-bottom: var(--border-width) solid var(--bordercolor);

    .heading-title { margin: 0; padding-bottom: .5rem; font-size: 1.6rem; font-weight: 800; white-space: nowrap; }
    .heading-actions { display: flex; align-items: center; gap: .5rem; margin-bottom: 3.5px; }
    /* 동작 버튼은 글자 버튼(새 글 쓰기)도 아이콘 버튼(새로고침)과 같은 높이로 맞춘다. 링크로 감싼 버튼은 링크가 줄 높이를 더하지 않게 flex 로 둔다 */
    .heading-actions > a { display: flex; }
    .heading-actions > button, .heading-actions > a > * { box-sizing: border-box; height: 38px; }

    /* 제목·버튼이 한 줄, 탭은 아래 줄을 꽉 채운다 */
    ${mobile} {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        row-gap: .25rem;
        .heading-title { padding-bottom: 0; }
        .heading-actions { margin-bottom: 0; }
        .heading-actions > button, .heading-actions > a > * { height: 44px; }
    }
`;

/** 밑줄 탭. 링크 묶음(nav)과 tab 역할 버튼 묶음(div)이 같은 모양이라 as 로 태그만 바꾼다 */
export const TabsRoot = styled.div`
    display: flex;
    gap: 6px;
    min-width: 0;

    a, button {
        margin-bottom: calc(-1 * var(--border-width));
        padding: 10px 16px;
        border: 0;
        border-bottom: 2px solid transparent;
        background: none;
        color: var(--desccolor);
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
        text-decoration: none;
        cursor: pointer;
        transition: color 150ms ease, border-color 150ms ease;
    }
    /* 탭 한 줄(위아래 10px + 14px 글자) 높이. 탭이 늦게 그려져도 머리줄 높이가 움직이지 않는다 */
    &[data-placeholder] { min-height: calc(20px + 14px * 1.5); }
    [data-current] { color: var(--linkhovercolor); border-bottom-color: var(--linkhovercolor); }
    a:not([data-current]):hover, button:not([data-current]):hover { color: var(--foreground); border-bottom-color: var(--bordercolor); }
    a:focus-visible, button:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: -2px; border-radius: 6px 6px 0 0; }

    ${mobile} {
        grid-column: 1 / -1;
        grid-row: 2;
        &[data-placeholder] { min-height: 44px; }
        a, button { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 8px; }
    }
`;
