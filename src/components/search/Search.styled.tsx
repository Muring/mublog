"use client";

import styled from "@emotion/styled";
import { scrim, overlayPanel } from "@/styles/motion";
import { dialogSurface, hoverSurface } from "@/styles/surface";
import { mobile } from "@/styles/breakpoints";

/** 헤더의 검색 버튼. 아이콘 + "검색" 라벨. 오른쪽 로그인 영역과는 한 칸 띄운다. */
export const SearchTrigger = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    /* 헤더 왼쪽 메뉴·아이콘 링크(3rem 정사각형)와 높이를 맞추고, 아이콘만 남는 좁은 화면에서도 그보다 좁아지지 않는다 */
    height: 3rem;
    min-width: 3rem;
    justify-content: center;
    padding: 0 0.75rem;
    margin-right: 1rem;
    border: 0;
    border-radius: 0.5rem;
    background: none;
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
        background-color: var(--hovercolor);
        color: var(--hoverfontcolor);
        transition: 0.1s ease-in-out;
    }
    ${mobile} {
        padding: 0 0.5rem;
        margin-right: 0.5rem;
        /* 좁은 화면에서는 아이콘만 */
        span {
            display: none;
        }
    }
`;

/* 뒤를 가리는 막(공용 scrim). 네이티브 dialog 라 기본 크기·여백을 걷어낸다 */
export const SearchOverlay = styled.dialog`
    ${scrim()}
    box-sizing: border-box;
    width: 100vw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    margin: 0;
    border: 0;
    color: var(--foreground);
    z-index: 200;
    display: none;
    &[open] { display: flex; }
    align-items: flex-start;
    justify-content: center;
    padding: 12vh 1rem 1rem;
    /* 결과 목록은 제 안에서 굴린다 */

    ${mobile} {
        padding-top: 6vh;
    }
`;

export const SearchPanel = styled.div`
    width: min(40rem, 100%);
    max-height: 76vh;
    display: flex;
    flex-direction: column;
    ${dialogSurface}
    overflow: hidden;
    ${overlayPanel("pop")}

    .search-input-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.9rem 1rem;
        border-bottom: 1px solid var(--bordercolor);
        color: var(--desccolor);
    }
    .search-input-row svg {
        flex-shrink: 0;
    }
    input {
        flex: 1;
        min-width: 0;
        border: 0;
        background: none;
        color: var(--foreground);
        font-family: inherit;
        font-size: 1rem;
        outline: none;
    }
    input::placeholder {
        color: var(--desccolor);
    }
    kbd {
        padding: 0.15rem 0.4rem;
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 0.3rem;
        font-family: inherit;
        font-size: 0.7rem;
        color: var(--desccolor);
    }

    .search-results {
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0.5rem;
        margin: 0;
        list-style: none;
    }
    .search-status {
        padding: 1.5rem 1rem;
        text-align: center;
        font-size: 0.85rem;
        color: var(--desccolor);
    }

    .search-hit + .search-hit {
        border-top: 1px solid var(--bordercolor);
    }
    .search-hit a {
        display: block;
        padding: 0.8rem 0.8rem;
        border-radius: 0.5rem;
        color: var(--foreground);
        text-decoration: none;
    }
    /* 호버 면 위에서는 제목·본문·태그 전부 어두운 값을 따라야 한다 */
    .search-hit[data-focused="true"] a {
        ${hoverSurface}
    }
    .search-hit[data-focused="true"] .hit-meta,
    .search-hit[data-focused="true"] .hit-snippet {
        color: var(--hoverdesccolor);
    }
    .hit-title {
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1.5;
        word-break: keep-all;
    }
    .hit-snippet {
        margin-top: 0.2rem;
        font-size: 0.8rem;
        line-height: 1.6;
        color: var(--desccolor);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .hit-meta .item { display: inline-flex; align-items: center; gap: 4px; min-width: 0; }
    .hit-meta {
        margin-top: 0.3rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem 0.6rem;
        font-size: 0.72rem;
        color: var(--desccolor);
    }
    mark {
        background: none;
        color: var(--linkhovercolor);
        font-weight: 700;
    }
`;
