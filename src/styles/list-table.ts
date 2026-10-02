import { css } from '@emotion/react';

/** 관리자 목록의 공통 표 바탕·머리글·행. 열 구성과 모바일 배치는 화면이 맡는다. */
export const listTableBase = css`
    width: 100%;
    background-color: var(--tablesurface);
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    font-size: .875rem;
    th, td {
        border-bottom: var(--border-width) solid var(--bordercolor);
        padding: .75rem .5rem;
        text-align: left;
        vertical-align: middle;
    }
    thead th {
        position: sticky;
        top: 0;
        z-index: 1;
        height: 2.5rem;
        box-sizing: border-box;
        padding-block: 0;
        background-color: var(--codefontbgcolor);
        color: var(--foreground);
        font-size: .75rem;
        font-weight: 800;
        letter-spacing: .03em;
        text-align: center;
        box-shadow: inset 0 1px 0 var(--bordercolor), inset 0 -2px 0 var(--bordercolor);
    }
    tbody tr:hover { background-color: var(--codefontbgcolor); }
`;
