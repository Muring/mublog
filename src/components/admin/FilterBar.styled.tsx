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
        .bar-status { flex-basis: 100%; }
        .bar-main { flex-basis: 180px; }
        .status-filters { width: 100%; }
        .status-filters button { flex: 1 0 auto; min-height: 44px; padding-inline: 10px; }
        .status-filters { height: auto; min-height: 50px; }
        .bar-search > input { height: 44px; font-size: 16px; }
        .bar-toggle, .bar-sort > div > button { min-height: 44px; }
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
