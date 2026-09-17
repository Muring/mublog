"use client";

import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";

/**
 * 전체 화면 이미지 뷰어. 포트폴리오 갤러리와 본문 이미지가 같이 쓴다.
 * 테마 배경 위에 툴바(설명·더 크게 보기·이미지 파일·닫기) / 캔버스 / 이전·다음 순으로 쌓인다.
 */
export const ViewerDialog = styled.dialog`
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: var(--background);
    color: var(--foreground);

    &[open] {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
    }
    &::backdrop {
        background: rgb(0 0 0 / 80%);
    }

    .viewer-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        padding: 18px 24px;
        border-bottom: 1px solid var(--bordercolor);
    }
    .viewer-toolbar strong {
        font-size: 14px;
    }
    .viewer-toolbar p {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--desccolor);
        word-break: keep-all;
    }
    .viewer-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .viewer-actions button,
    .viewer-actions a {
        padding: 10px 12px;
        font: inherit;
        font-size: 13px;
        background: var(--background);
        color: var(--foreground);
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 5px;
        cursor: pointer;
        text-decoration: none;
        outline: 1px solid transparent;
        outline-offset: calc(-1 * var(--border-width));
        transition: outline-color 150ms ease, border-color 150ms ease, color 150ms ease;
    }
    .viewer-actions button:hover,
    .viewer-actions a:hover {
        border-color: transparent;
        outline-color: var(--linkhovercolor);
        color: var(--linkhovercolor);
    }

    .viewer-canvas {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        min-height: 0;
        padding: 20px;
    }
    .viewer-canvas img {
        display: block;
        flex-shrink: 0;
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    .viewer-canvas[data-zoomed="true"] {
        display: block;
    }
    .viewer-canvas[data-zoomed="true"] img {
        max-width: none;
        max-height: none;
        min-width: 100%;
        margin: 0 auto;
    }

    .viewer-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        padding: 12px 20px;
        border-top: 1px solid var(--bordercolor);
    }
    .viewer-footer a {
        font-size: 13px;
        color: var(--foreground);
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    .viewer-nav {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-shrink: 0;
    }
    .viewer-nav button {
        width: 40px;
        height: 40px;
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 50%;
        background: var(--background);
        color: var(--foreground);
        font-size: 17px;
        cursor: pointer;
        outline: 1px solid transparent;
        outline-offset: calc(-1 * var(--border-width));
        transition: outline-color 150ms ease, border-color 150ms ease, color 150ms ease;
    }
    .viewer-nav button:disabled {
        opacity: 0.3;
        cursor: default;
    }
    .viewer-nav button:hover:not(:disabled) {
        color: var(--linkhovercolor);
        border-color: transparent;
        outline-color: var(--linkhovercolor);
    }
    .viewer-nav > span {
        font-size: 12px;
        font-variant-numeric: tabular-nums;
    }
    .viewer-nav > span > span {
        color: var(--desccolor);
    }

    button:focus-visible,
    a:focus-visible,
    [tabindex]:focus-visible {
        outline: 2px solid var(--linkhovercolor);
        outline-offset: 2px;
    }

    ${mobile} {
        .viewer-toolbar {
            padding: 12px 14px;
        }
        .viewer-actions {
            gap: 8px;
        }
        .viewer-actions button,
        .viewer-actions a {
            font-size: 12px;
            padding: 9px;
        }
        .viewer-canvas {
            padding: 8px;
        }
    }
`;
