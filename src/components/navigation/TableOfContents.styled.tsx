"use client";

import styled from "@emotion/styled";

/*
 * 기본은 좁은 화면의 인라인 배치다 — 접힌 한 줄 바(토글)만 보이고, 펼치면 페이지 흐름 안에
 * 그대로 늘어난다. 내부 스크롤·최대 높이를 여기 두면 본문 위에서 휠이 페이지 대신 목차에 먹히므로
 * 그 값들과 고정 패널 전용 요소(제목·맨 위로)는 감싸는 쪽(PostNavigation·portfolio)의
 * `position: fixed` 미디어 쿼리가 `[data-toc] [data-toc-*]` 속성으로 켠다.
 * 감싸는 쪽 규칙은 여기 규칙(루트 클래스 + 클래스 하나)보다 한 단계 높아야 이긴다.
 *
 * 포스트에서는 본문 Article 안에 놓여 그쪽의 p·li·a 태그 규칙(여백·불릿·링크색·밑줄)을 물려받는다.
 * 아래 규칙은 루트 클래스를 앞에 붙인 우선순위로 그 값들을 되돌린다.
 */
export const TocNav = styled.nav`
    line-height: 1.7;
    color: var(--foreground);
    padding: 14px 10px;
    border: var(--border-width) solid var(--bordercolor);
    border-radius: 12px;
    background: var(--background);
    font-size: 12px;

    .toc-title {
        display: none;
        margin: 0 0 10px;
        font-weight: 800;
        text-align: center;
    }
    .toc-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0;
        border: 0;
        background: none;
        font: inherit;
        font-weight: 800;
        color: var(--foreground);
        cursor: pointer;
        transition: color 150ms ease;
    }
    .toc-toggle::after {
        content: "";
        width: 6px;
        height: 6px;
        margin-right: 4px;
        border-right: 1.5px solid currentColor;
        border-bottom: 1.5px solid currentColor;
        transform: translateY(-2px) rotate(45deg);
        transition: transform 150ms ease;
    }
    .toc-toggle[aria-expanded="true"]::after {
        transform: translateY(2px) rotate(225deg);
    }
    .toc-toggle:hover,
    .toc-toggle:focus-visible {
        color: var(--linkhovercolor);
    }
    .toc-toggle:focus-visible {
        outline: 2px solid var(--linkhovercolor);
        outline-offset: 4px;
        border-radius: 3px;
    }
    .toc-body {
        margin-top: 10px;
    }
    /* :where 로 우선순위를 .toc-body 와 같게 둔다. 고정 패널에서는 감싸는 쪽이 접힘과 상관없이 펼친다 */
    .toc-body:where([data-collapsed]) {
        display: none;
    }
    .toc-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .toc-list li {
        margin-left: 0;
        font-size: inherit;
        list-style: none;
    }
    /* 상위는 본문색·굵게, 하위는 보조색·가늘게로 나눈다. 레일은 하위 묶음에만 두고 상위에는 긋지 않는다 —
       상자 테두리와 겹쳐 선이 많아 보인다. 현재 위치 마커는 상위에서는 항목 왼쪽 끝, 하위에서는 레일 위에 붙는다. */
    .toc-body > .toc-list > li + li {
        margin-top: 6px;
    }
    .toc-list a {
        position: relative;
        display: block;
        padding: 4px 4px 4px 8px;
        /* 항목 안의 줄은 촘촘히, 항목 사이는 넓게 — 접힌 둘째 줄과 다음 항목이 갈리도록. */
        line-height: 1.4;
        font-weight: 700;
        color: var(--foreground);
        overflow-wrap: anywhere;
        text-decoration: none;
        transition: color 150ms ease, border-color 150ms ease;
    }
    /* 마커는 항목 높이를 꽉 채운다. 안쪽 레일이 하위 항목 높이의 합이라, 짧게 하면 선 길이가 어긋난다. */
    .toc-list a::before {
        content: "";
        position: absolute;
        left: -1px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: transparent;
        transition: background-color 150ms ease, border-color 150ms ease;
    }
    .toc-list a:hover {
        color: var(--linkhovercolor);
        text-decoration: none;
    }
    /* 상위 항목은 공용 밑줄 링크처럼 호버하면 밑줄이 왼쪽에서 그어진다.
       ::after 로 항목 상자 전체에 그으면 여백까지 덮고 접힌 둘째 줄을 못 따라가므로,
       글자를 감싼 span 의 배경 선을 늘린다 — 줄마다 따로 그어진다. 하위 항목은 색만 바꾼다. */
    .toc-body > .toc-list > li > a > .toc-label {
        background: linear-gradient(currentColor, currentColor) no-repeat left bottom / 0 1px;
        -webkit-box-decoration-break: clone;
        box-decoration-break: clone;
        padding-bottom: 2px;
        transition: background-size 280ms ease;
    }
    .toc-body > .toc-list > li > a:is(:hover, :focus-visible) > .toc-label {
        background-size: 100% 1px;
    }
    /* 강조는 색과 마커로만 한다. 굵기를 바꾸면 글자 폭이 늘어 줄이 다시 접힌다. */
    .toc-list a[aria-current="location"] {
        color: var(--linkhovercolor);
    }
    .toc-list a[aria-current="location"]::before {
        background: var(--linkhovercolor);
    }
    .toc-list .toc-list {
        margin: 2px 0 4px 8px;
        border-left: 1px solid var(--bordercolor);
    }
    .toc-list .toc-list li + li {
        margin-top: 3px;
    }
    .toc-list .toc-list a {
        padding: 3px 4px 3px 8px;
        font-size: 11px;
        font-weight: 400;
        color: var(--portfolio-description);
    }
    /* 위 규칙이 같은 우선순위로 뒤에 오므로, 하위의 현재·호버 색을 다시 명시해야 한다. */
    .toc-list .toc-list a:hover,
    .toc-list .toc-list a[aria-current="location"] {
        color: var(--linkhovercolor);
    }
    .toc-top {
        display: none;
        color: var(--foreground);
        margin-top: 12px;
        padding: 10px 8px 4px;
        text-align: center;
        border-top: 1px solid var(--bordercolor);
        text-decoration: underline;
        text-underline-offset: 4px;
        transition: color 150ms ease, border-color 150ms ease;
    }
    .toc-top:hover,
    .toc-top:focus-visible {
        color: var(--linkhovercolor);
        text-decoration: underline;
    }
    @media (prefers-reduced-motion: reduce) {
        .toc-body > .toc-list > li > a > .toc-label {
            transition: none;
        }
    }

    html:has(&) {
        scroll-behavior: smooth;
    }
    @media (prefers-reduced-motion: reduce) {
        html:has(&) {
            scroll-behavior: auto;
        }
    }
`;
