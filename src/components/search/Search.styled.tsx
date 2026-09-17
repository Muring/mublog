"use client";

import styled from "@emotion/styled";
import { surface, hoverSurface } from "@/styles/surface";
import { mobile } from "@/styles/breakpoints";

/** 헤더의 검색 버튼. 아이콘 + "검색" 라벨. 오른쪽 로그인 영역과는 한 칸 띄운다. */
export const SearchTrigger = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 2.25rem;
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
    &:focus-visible {
        outline: 2px solid var(--bordercolor);
        outline-offset: 1px;
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

/* 뒤를 가리는 막. ConfirmOverlay 와 같은 이유로 토큰을 쓰지 않는다 */
export const SearchOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 12vh 1rem 1rem;
    background-color: rgba(0, 0, 0, 0.5);

    animation: search-fade 0.12s ease-out;
    @keyframes search-fade {
        from {
            opacity: 0;
        }
    }
    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }

    ${mobile} {
        padding-top: 6vh;
    }
`;

export const SearchPanel = styled.div`
    width: min(40rem, 100%);
    max-height: 76vh;
    display: flex;
    flex-direction: column;
    ${surface("0.75rem")}
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    overflow: hidden;

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
