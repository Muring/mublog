"use client";

import styled from "@emotion/styled";

/** 범례. 계열이 여럿이라 늘 보인다. 항목을 누르면 그 선을 껐다 켠다 */
export const Legend = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.9rem;
    margin-top: 0.6rem;

    button {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.15rem 0.2rem;
        border: 0;
        background: none;
        color: var(--foreground);
        font-family: inherit;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
    }
    button .swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        background: var(--series);
    }
    button .total {
        color: var(--desccolor);
        font-weight: 500;
        font-variant-numeric: tabular-nums;
    }
    /* 꺼진 계열. 글자는 남기고 색 조각만 비운다 — 대비를 opacity 로 낮추지 않는다 */
    button[aria-pressed="false"] .swatch {
        background: transparent;
        box-shadow: inset 0 0 0 1.5px var(--series);
    }
    button[aria-pressed="false"] {
        color: var(--desccolor);
    }
`;

/** 한 칸(날짜)에 걸친 세로 띠 + 그 칸의 값 전부를 담은 툴팁 */
export const Column = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--x);
    width: var(--w);
    transform: translateX(-50%);
    cursor: default;

    &:focus-visible {
        outline: none;
    }

    /* 가리킨 칸을 세로선으로 표시한다 */
    .rule {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 1px;
        background: var(--bordercolor);
        opacity: 0;
        pointer-events: none;
    }
    &:hover .rule,
    &:focus-visible .rule {
        opacity: 1;
    }

    .dot {
        position: absolute;
        top: var(--y);
        left: 50%;
        width: 8px;
        height: 8px;
        margin: -4px 0 0 -4px;
        border-radius: 50%;
        background: var(--series);
        border: 2px solid var(--cardbackground);
        opacity: 0;
        pointer-events: none;
    }
    &:hover .dot,
    &:focus-visible .dot {
        opacity: 1;
    }

    .tip {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -0.4rem);
        z-index: 5;
        display: none;
        padding: 0.35rem 0.55rem;
        border-radius: 0.35rem;
        background: var(--foreground);
        color: var(--background);
        font-size: 0.7rem;
        line-height: 1.5;
        white-space: nowrap;
        pointer-events: none;
    }
    .tip .date {
        display: block;
        font-weight: 800;
        margin-bottom: 0.15rem;
    }
    .tip .row {
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }
    .tip .swatch {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        background: var(--series);
    }
    .tip .value {
        margin-left: auto;
        font-variant-numeric: tabular-nums;
        font-weight: 700;
    }
    &:hover .tip,
    &:focus-visible .tip {
        display: block;
    }
    /* 왼쪽·오른쪽 끝 칸은 툴팁이 카드 밖으로 나가지 않게 안쪽으로 붙인다 */
    &[data-edge="first"] .tip {
        left: 0;
        transform: translate(0, -0.4rem);
    }
    &[data-edge="last"] .tip {
        left: auto;
        right: 0;
        transform: translate(0, -0.4rem);
    }
`;
