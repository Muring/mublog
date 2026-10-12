"use client";

import styled from "@emotion/styled";
import { segmented } from "@/styles/segmented";
import { buttonSubtle } from "@/styles/button";
import { mobile } from "@/styles/breakpoints";

export const FilterBarRoot = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
    min-width: 0;
    .bar-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; }
    .bar-status { min-width: 0; max-width: 100%; }
    .status-filters {
        ${segmented}
        width: max-content;
        max-width: 100%;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--bordercolor) transparent;
    }
    .status-filters button { display: flex; align-items: center; justify-content: center; gap: 6px; flex: 0 0 auto; }
    .filter-count { font-variant-numeric: tabular-nums; font-weight: 400; }
    .bar-main { display: flex; flex: 1 1 260px; gap: 8px; min-width: 0; }
    .bar-search { position: relative; flex: 1; min-width: 0; }
    .bar-main:not(:has(.bar-search)) { justify-content: flex-end; }
    .bar-search > svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 17px; height: 17px; color: var(--desccolor); pointer-events: none; }
    .bar-search > input {
        box-sizing: border-box;
        width: 100%; min-width: 0; height: 40px;
        padding: 0 12px 0 38px;
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 8px;
        background: var(--background); color: var(--foreground);
        font: inherit; font-size: 14px;
    }
    .bar-search > input::placeholder { color: var(--desccolor); }
    /* 좁은 화면에서 펼친 검색을 접는 버튼. 넓은 화면은 검색창이 늘 펼쳐져 있어 쓰지 않는다 */
    .search-close {
        position: absolute; top: 0; right: 0; display: none; align-items: center; justify-content: center;
        width: 44px; height: 44px; padding: 0; border: 0; border-radius: 8px; background: none; color: var(--desccolor); cursor: pointer;
        transition: color 150ms ease, background-color 150ms ease;
    }
    .search-close:hover { background: var(--control-hover-bg); color: var(--foreground); }
    .search-close svg { width: 18px; height: 18px; }
    .bar-search > input:hover { border-color: var(--foreground); }
    .bar-search > input:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    .bar-anchor { position: relative; flex-shrink: 0; }
    .bar-toggle {
        ${buttonSubtle}
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        height: 40px; padding: 0 12px; border-radius: 8px;
        background: var(--background); color: var(--foreground); font-size: 14px;
    }
    .bar-toggle:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    .bar-toggle > svg { width: 18px; height: 18px; }
    .bar-toggle > svg circle { fill: var(--background); }
    .bar-toggle:hover > svg circle { fill: var(--control-hover-bg); }
    .bar-toggle[aria-expanded="true"] { border-color: var(--foreground); }
    .bar-badge { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .bar-results { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
    .bar-summary { margin: 0; min-width: 0; color: var(--desccolor); font-size: 13px; line-height: 1.5; }
    .bar-sort { position: relative; flex-shrink: 0; }
    /* 필터 버튼은 테두리로, 정렬 버튼은 공용 ghost 스타일로 구분한다. */
    .bar-toggle {
        box-sizing: border-box;
        height: 40px;
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 8px;
        background: var(--background);
        color: var(--foreground);
        font-size: 14px;
        font-weight: 700;
        outline: var(--border-width) solid transparent;
        outline-offset: calc(-1 * var(--border-width));
        transition: border-color 150ms ease, outline-color 150ms ease,
            background-color 150ms ease, color 150ms ease;
    }
    .bar-toggle:hover:not(:disabled) {
        border-color: transparent;
        outline-color: var(--foreground);
        background-color: var(--control-hover-bg);
        color: var(--foreground);
    }
    .bar-toggle:focus-visible, .bar-toggle:hover:focus-visible {
        outline: 2px solid var(--linkhovercolor);
        outline-offset: 2px;
    }
    .bar-toggle[aria-expanded="true"]:not(:hover):not(:focus-visible) {
        border-color: var(--foreground);
        outline-color: transparent;
        background: var(--background);
    }
    &[data-loading] {
        .bar-search > input, .bar-search > svg, .bar-toggle, .bar-sort > div { visibility: hidden; }
        .bar-search::after, .bar-anchor::after, .bar-sort::after {
            content: ""; position: absolute; inset: 0;
            border-radius: 8px; background: var(--codefontbgcolor);
        }
        .bar-summary { width: 6rem; max-width: 100%; border-radius: 4px; color: transparent; background: var(--codefontbgcolor); }
        .status-filters button { position: relative; color: transparent; }
        .status-filters button::after {
            content: ""; position: absolute; inset: 10px 8px;
            border-radius: 3px; background: var(--bordercolor);
        }
    }
    ${mobile} {
        /*
         * 좁은 화면은 페이지 하나로 스크롤한다(목록이 따로 스크롤하지 않는다, AdminListScroll).
         * 필터는 헤더(64px) 바로 아래에 붙어 목록이 그 밑으로 지나간다. 바탕을 칠해야 지나가는 행이 비치지 않고,
         * border-image 로 그 바탕을 좌우 화면 끝까지 늘린다(레이아웃 폭은 그대로).
         * 바로 위 부모가 목록까지 감싸는 상자여야 붙는다 — 필터만 감싼 상자 안에서는 움직일 자리가 없다.
         */
        position: sticky;
        top: 64px;
        z-index: 10;
        margin: -8px 0 0;
        padding: 8px 0 12px;
        background: var(--background);
        border-image: linear-gradient(var(--background) 0 0) fill 0 / / 0 100vmax;

        /*
         * 상태 · 검색 · 필터 · 정렬을 한 줄에 둔다. 붙어 있는 바가 두세 줄이면 화면의 4분의 1을 덮었다.
         * 검색은 44px 아이콘 칸으로 접혀 있다가 초점을 받으면 그 줄을 덮고, 필터·정렬은 글자 없이 아이콘만 남긴다.
         * 상태 칸이 많아 넘치면(이미지) 상태 묶음만 가로로 민다.
         */
        .bar-controls { flex-wrap: nowrap; }
        .bar-status { flex: 1 1 0; }
        .status-filters { width: 100%; height: auto; min-height: 44px; }
        .status-filters button { flex: 1 0 auto; min-height: 38px; padding-inline: 8px; gap: 4px; }
        .bar-main { flex: 0 0 auto; }
        .bar-search { flex: 0 0 44px; }
        .bar-search > input { height: 44px; padding: 0; font-size: 16px; color: transparent; caret-color: transparent; cursor: pointer; }
        .bar-search > input::placeholder { color: transparent; }
        .bar-search > input::-webkit-search-cancel-button { display: none; }
        .bar-search > svg { left: 50%; transform: translate(-50%, -50%); }
        /* 접힌 채로 검색어가 걸려 있으면 점으로 알린다 */
        &[data-query]:not([data-searching]) .bar-search::after {
            content: ""; position: absolute; top: 8px; right: 8px; width: 6px; height: 6px;
            border-radius: 50%; background: var(--linkhovercolor); pointer-events: none;
        }
        .bar-toggle { position: relative; width: 44px; height: 44px; padding: 0; gap: 0; font-size: 0; }
        .bar-badge { position: absolute; top: 3px; right: 5px; font-size: 10px; }
        .bar-sort > div { display: flex; }
        .bar-sort button { width: 44px; height: 44px; padding: 0; justify-content: center; }
        .bar-sort button > span { display: none; }
        .bar-sort button::after, .bar-sort button[aria-expanded="true"]::after {
            left: 50%; right: auto; width: 18px; height: 18px; border: 0;
            background: currentColor; transform: translate(-50%, -50%);
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4'/%3E%3C/svg%3E") center / contain no-repeat;
        }
        &[data-searching] .bar-status, &[data-searching] .bar-anchor, &[data-searching] .bar-sort { display: none; }
        &[data-searching] .bar-main, &[data-searching] .bar-search { flex: 1 1 auto; }
        &[data-searching] .bar-search > input { padding: 0 44px 0 38px; color: var(--foreground); caret-color: auto; cursor: text; }
        &[data-searching] .bar-search > input::placeholder { color: var(--desccolor); }
        &[data-searching] .bar-search > svg { left: 12px; transform: translateY(-50%); }
        &[data-searching] .search-close { display: flex; }

        /*
         * 상태가 한 줄을 다 쓰는 배치(statusRow). 상태 칸을 옆으로 밀어야 보이게 두면 정리할 때 볼 개수(미사용·삭제 예정)가 가려진다.
         * 둘째 줄은 개수 요약(왼쪽)과 검색·필터·정렬 아이콘(오른쪽)이 나눠 써서, 줄 수는 늘어도 높이는 거의 같다.
         * 묶음 상자(.bar-controls·.bar-results)를 풀어 그 안의 칸을 바로 격자에 놓는다.
         */
        &[data-status-row] {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto auto;
            grid-template-areas: "status status status" "summary main sort";
            gap: 8px;
        }
        &[data-status-row] .bar-controls, &[data-status-row] .bar-results { display: contents; }
        &[data-status-row] .bar-status { grid-area: status; }
        &[data-status-row] .bar-main { grid-area: main; }
        &[data-status-row] .bar-sort { grid-area: sort; }
        &[data-status-row] .bar-summary { grid-area: summary; align-self: center; }
        &[data-status-row] > :not(.bar-controls):not(.bar-results) { grid-column: 1 / -1; grid-row: 3; }
        &[data-status-row][data-searching] .bar-status { display: block; }
        &[data-status-row][data-searching] .bar-summary { display: none; }
        &[data-status-row][data-searching] .bar-main { grid-column: 1 / -1; }
    }
`;

export const FilterPopover = styled.div`
    position: absolute; top: calc(100% + 8px); right: 0; z-index: 40;
    width: min(360px, calc(100vw - 32px));
    max-height: min(70dvh, 640px);
    display: flex; flex-direction: column;
    border: var(--border-width) solid var(--bordercolor); border-radius: 12px;
    background: var(--cardbackground); color: var(--foreground);
    box-shadow: 0 8px 24px var(--shadowcolor);
    overflow: hidden;
    .filter-heading { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; gap: 12px; }
    .filter-close { width: 36px; height: 36px; padding: 0; justify-content: center; border-color: transparent; background: transparent; }
    .filter-close:hover { background: var(--control-hover-bg); color: var(--foreground); }
    h2 { margin: 0; font-size: 16px; font-weight: 700; }
`;

export const FilterFormRoot = styled.form`
    --dropdown-popup-width: min(326px, calc(100vw - 34px));
    display: flex; flex-direction: column; min-height: 0; min-width: 0;
    .filter-fields { display: grid; gap: 20px; padding: 4px 16px 20px; overflow-y: auto; overscroll-behavior: contain; }
    .filter-field { display: grid; gap: 8px; min-width: 0; }
    .field-label { display: block; font-size: 13px; font-weight: 600; color: var(--foreground); }
    .field-hint { margin-left: 6px; color: var(--desccolor); font-size: 12px; font-weight: 400; }
    .filter-field > div, .filter-field > div > button { width: 100%; min-width: 0; }
    .filter-field > div > button { height: 40px; font-size: 14px; }
    .filter-dates { margin: 0; padding: 0; border: 0; min-width: 0; }
    .filter-dates legend { margin-bottom: 10px; padding: 0; }
    .date-inputs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .date-inputs label { display: grid; gap: 6px; min-width: 0; color: var(--desccolor); font-size: 12px; }
    input[type="date"] {
        width: 100%; min-width: 0; box-sizing: border-box; height: 40px;
        padding: 0 8px; border: var(--border-width) solid var(--bordercolor); border-radius: 8px;
        background: var(--background); color: var(--foreground); font: inherit; font-size: 14px; color-scheme: light;
    }
    html.dark & input[type="date"] { color-scheme: dark; }
    input[type="date"]:hover { border-color: var(--foreground); }
    input[type="date"]:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    input[aria-invalid="true"] { border-color: var(--dangercolor); }
    .field-error { margin: 8px 0 0; font-size: 13px; color: var(--dangercolor); }
    .filter-actions { flex-shrink: 0; display: flex; gap: 8px; padding: 12px 16px; border-top: var(--border-width) solid var(--bordercolor); }
    .filter-actions > button { min-height: 40px; justify-content: center; }
    .filter-actions > button:first-child { flex: 1; }
    .filter-actions > button:last-child { flex: 2; }
    ${mobile} {
        --dropdown-popup-width: calc(100vw - 34px);
        .filter-field > div > button, input[type="date"] { height: 44px; font-size: 16px; }
        .filter-actions { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
        .filter-actions > button { min-height: 44px; }
        .filter-field .dropdown-search { font-size: 16px; min-height: 44px; }
    }
`;
