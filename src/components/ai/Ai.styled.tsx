"use client";

import styled from "@emotion/styled";
import { desktop, mobile } from "@/styles/breakpoints";
import { animatedLink } from "@/styles/link";

/**
 * AI 공개 페이지(/ai)와 AI 관리(/ai/manage)의 화면 규칙.
 *
 * 여러 컴포넌트가 같은 클래스를 나눠 쓰므로 페이지 뿌리 하나에 규칙을 모으고, 안쪽은 접두사 클래스로 고른다 —
 * 공개 페이지·사용량 쪽은 `ai-`, 관리 작업 기록 쪽은 `aim-`. 두 묶음은 이름이 겹치는 것(workspace 등)이 있어 접두사를 나눈다.
 * 뿌리 자신이 page·shell 일 때를 위해 `&.ai-page`·`&.aim-shell` 대안을 함께 둔다. 순서는 사용량 → 관리다(뒤가 이긴다).
 */
export const AiRoot = styled.div`
    /* ── 공개 페이지·사용량 (ai-) ── */
    &.ai-page, .ai-page { max-width: 1000px; margin: auto; padding: 7rem 1.25rem 4rem; }
    .ai-hero { margin-bottom: 2.5rem; }
    .ai-hero h1 { font-size: clamp(2rem, 5vw, 3.6rem); margin: .5rem 0 1rem; letter-spacing: -.05em; line-height: 1.28; text-wrap: balance; word-break: keep-all; }
    .ai-eyebrow, .ai-note { color: var(--desccolor); font-size: .85rem; line-height: 1.7; }
    .ai-prose { line-height: 1.85; }
    .ai-prose, .ai-note, .ai-warning, .ai-emptyState { word-break: keep-all; overflow-wrap: anywhere; }
    .ai-paragraph { display: block; }
    .ai-paragraph + .ai-paragraph { margin-top: .85em; }
    /* A sentence moves to the next line whole when it does not fit; a sentence wider than the line still wraps inside. */
    .ai-sentence { display: inline-block; max-width: 100%; }
    .ai-section { margin: 2rem 0; }
    .ai-card { background: var(--cardbackground); border: var(--border-width) solid var(--bordercolor); border-radius: 14px; padding: 1rem; min-width: 0; }
    .ai-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; margin: 1rem 0; }
    .ai-card strong { display: block; font-size: clamp(1rem, 1.45vw, 1.2rem); margin-top: .4rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .ai-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; flex-shrink: 0; }
    .ai-tableScroll { overflow: auto; min-height: 0; border: var(--border-width) solid var(--bordercolor); border-radius: 12px; scrollbar-gutter: stable; background: var(--cardbackground); }
    .ai-tableScroll table { border-collapse: separate; border-spacing: 0; width: 100%; font-size: .85rem; white-space: nowrap; }
    .ai-tableScroll th, .ai-tableScroll td { padding: .75rem; text-align: left; border-bottom: var(--border-width) solid var(--bordercolor); }
    /* Headers are centred; fixed-format values (dates, short states) are centred too since every value has the same width. */
    .ai-tableScroll th, .ai-tableScroll td[data-center] { text-align: center; }
    .ai-tableScroll th { position: sticky; top: 0; background: var(--cardbackground); z-index: 1; }
    .ai-tableScroll td[data-number] { text-align: right; font-variant-numeric: tabular-nums; }
    .ai-tableScroll caption { text-align: left; padding: .75rem 1rem; color: var(--desccolor); }
    /*
     * 좌우 여백을 같게 둔다. 첫 열(날짜)은 가운데 정렬이라 열이 넓으면 왼쪽만 크게 벌어졌다.
     * 첫 열은 내용 폭으로 줄이고(width: 1%) 남는 폭은 다른 열이 나눈다. 양 끝 칸의 바깥 여백은 1rem 으로 맞춘다.
     */
    .ai-tableScroll th:first-child, .ai-tableScroll td:first-child { width: 1%; padding-left: 1rem; }
    .ai-tableScroll th:last-child, .ai-tableScroll td:last-child { padding-right: 1rem; }
    /* 공개 표는 필터로 행 수가 바뀌지 않아 스크롤바 자리를 미리 비울 이유가 없다. 비워 두면 스크롤이 없을 때 오른쪽 10px 이 비고 행 선이 끊긴다 */
    .ai-publicTable { scrollbar-gutter: auto; container-type: inline-size; }
    .ai-publicTable[data-capped] { max-height: 24rem; }
    /* 공개 표는 페이지 폭이 아니라 상자 폭으로 판단한다. 여섯 칸이 다 들어가지 않으면 관리 화면처럼 수치를 한 칸에 쌓아 가로 스크롤을 없앤다 */
    @container (max-width: 700px) {
        .ai-publicTable .ai-wideCol { display: none; }
        .ai-publicTable .ai-narrowCol { display: table-cell; }
        .ai-publicTable .ai-cellSub { display: block; margin-top: .15rem; color: var(--desccolor); font-size: .72rem; line-height: 1.45; word-break: keep-all; }
        .ai-publicTable .ai-numStack { display: grid; gap: .15rem; justify-items: end; white-space: nowrap; }
        .ai-publicTable th .ai-numStack { font-size: .68rem; line-height: 1.3; }
        .ai-publicTable :is(th, td) { padding-inline: .75rem; }
    }
    /* The shared post slider is centred at 900px with arrow gutters; here it spans the section and drops the gutters unless it has arrows. */
    .ai-section .ai-relatedSlider { max-width: none; margin: 0; padding-bottom: .5rem; }
    .ai-section .ai-relatedSlider:not([data-looping="true"]) { padding-inline: 0; }
    .ai-warning { color: var(--warncolor); background: var(--warnbg); padding: .75rem; border-radius: 8px; }
    .ai-workspace { flex: 1; display: flex; flex-direction: column; gap: .75rem; min-height: 0; min-width: 0; }
    .ai-workspace .ai-grid { margin: 0; }
    .ai-workspace .ai-tableScroll, .ai-contentScroll { flex: 1; }
    .ai-contentScroll { overflow: auto; min-height: 0; padding: .25rem; }
    .ai-status { margin: 0; font-size: .85rem; }
    ${mobile} {
        .ai-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
        .ai-card { padding: .7rem; }
        &.ai-page, .ai-page { padding-top: 6rem; }
        .ai-workspace .ai-note { font-size: .75rem; }
        .ai-workspace .ai-card strong { font-size: 1.1rem; }
    }
    .ai-contentScroll summary { cursor: pointer; padding: .6rem; border-radius: 8px; }
    .ai-contentScroll summary:hover { background: var(--hovercolor); color: var(--hoverfontcolor); }
    /* Public narrative spacing is separate from the compact admin workspace. */
    &.ai-page .ai-hero, .ai-page .ai-hero { margin-bottom: 3rem; max-width: 850px; }
    .ai-highlight { color: var(--linkhovercolor); }
    &.ai-page .ai-hero .ai-prose, .ai-page .ai-hero .ai-prose { max-width: none; color: var(--desccolor); }
    &.ai-page .ai-section, .ai-page .ai-section { display: flex; flex-direction: column; gap: 1.5rem; margin: 3.5rem 0 0; }
    &.ai-page .ai-section > .ai-grid, .ai-page .ai-section > .ai-grid { margin: 0; }
    &.ai-page .ai-section > p, .ai-page .ai-section > p, .ai-sectionHeading p, .ai-comparison > p { margin: 0; }
    .ai-sectionHeading { display: flex; flex-direction: column; align-items: flex-start; gap: .65rem; }
    .ai-sectionHeading h2, .ai-sectionHeading h3 { margin: 0; line-height: 1.5; word-break: keep-all; }
    .ai-sectionHeading h2 { font-size: 1.7rem; letter-spacing: -.035em; }
    .ai-sectionHeading h3 { font-size: 1.15rem; }
    .ai-process { gap: 1rem; }
    .ai-process .ai-card { padding: 1.25rem; }
    .ai-process h2 { font-size: .95rem; margin: 0 0 .65rem; }
    .ai-process p { margin: 0; }
    &.ai-page .ai-card, .ai-page .ai-card { padding: 1.25rem; }
    /* 숫자 크기는 화면 폭이 아니라 카드 폭을 따른다. 10자리 토큰 수가 4열 카드 밖으로 넘치지 않게 한다 */
    &.ai-page .ai-grid > .ai-card, .ai-page .ai-grid > .ai-card { container-type: inline-size; }
    &.ai-page .ai-card strong, .ai-page .ai-card strong { font-size: clamp(.75rem, 12cqi, 1.25rem); margin-top: .6rem; }
    &.ai-page .ai-timeline, .ai-page .ai-timeline { margin: 0; }
    .ai-emptyState { padding: 1.5rem; border: var(--border-width) dashed var(--bordercolor); border-radius: 12px; color: var(--desccolor); font-size: .9rem; line-height: 1.8; }
    .ai-comparison { display: flex; flex-direction: column; gap: 1.25rem; }
    .ai-toolTotals { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; padding-bottom: 1.25rem; border-bottom: var(--border-width) solid var(--bordercolor); }
    .ai-toolTotals > div { min-width: 0; }
    /* 두 도구는 계열 팔레트의 1·2번(파랑·주황)을 고정으로 쓴다. 두 테마 모두 색각 검증을 통과한 값이다 */
    .ai-comparison [data-tool="Codex"] { --tool-color: var(--series-1); }
    .ai-comparison [data-tool="Claude"] { --tool-color: var(--series-2); }
    .ai-toolName { display: flex; align-items: center; gap: .5rem; font-size: .85rem; }
    .ai-toolName i { width: 1rem; height: 0; border-top: 2px solid var(--tool-color); }
    .ai-toolTotals small { font-size: .75rem; color: var(--desccolor); font-weight: normal; }
    /*
     * 주·월 꺾은선(관리 통계의 Plot·Column 을 두 선으로 쓴다). 상자 높이가 기간과 무관하게 일정해 안쪽 스크롤이 없다.
     */
    .ai-comparisonControls { display: flex; flex-wrap: wrap; gap: .5rem; }
    /* 주·월은 한 글자라 여백만으로는 31px 로 작아 보인다. 옆 버튼과 어울리게 최소 폭을 준다 */
    .ai-comparisonControls > [aria-label="묶는 단위"] button { min-width: 2.5rem; }
    /*
     * 좁은 화면에서는 여백을 화면 폭 단계별로 깎지 않고 줄 폭을 나눠 쓴다. 버튼은 최소 여백(5~6px)에서 출발해
     * 남는 자리를 고르게 채우므로, 공간이 있으면 넓어지고 모자랄 때만 좁아진다(340px 에서도 한 줄).
     */
    ${mobile} {
        .ai-toolbar > [aria-label="조회 기간"], .ai-comparisonControls > [aria-label="비교할 토큰 종류"] { flex: 1 1 auto; min-width: 0; }
        .ai-toolbar > [aria-label="조회 기간"] button { flex: 1 1 auto; padding-inline: 6px; }
        .ai-comparisonControls { gap: .4rem; align-self: stretch; }
        .ai-comparisonControls > [aria-label="비교할 토큰 종류"] button { flex: 1 1 auto; padding-inline: 5px; }
        .ai-comparisonControls > [aria-label="묶는 단위"] button { min-width: clamp(2rem, 9vw, 2.5rem); }
    }
    /* 위(합계 줄 구분선 → 안내)와 아래(범례 → 맨 위 눈금 글자)의 간격을 같은 20px 로 맞춘다 */
    .ai-chartBar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.625rem; }
    .ai-chartGuide { flex: 1; min-width: 0; display: grid; gap: .3rem; }
    .ai-chartGuide > .ai-note { margin: 0; }
    .ai-chartToolbar { flex-shrink: 0; }
    .ai-chartToolbar button { display: inline-grid; place-items: center; }
    .ai-lineChart { margin: 0; --plot-h: 220px; min-width: 0; --chart-ease: cubic-bezier(.33, 1, .68, 1); }
    .ai-lineChart [data-tool] { --series: var(--tool-color); }
    .ai-lineChart g[data-bridge] .line { stroke-dasharray: 4 4; }
    .ai-gapLegend { display: flex; align-items: center; gap: .5rem; margin: 0; font-size: .75rem; color: var(--desccolor); }
    .ai-gapLegend i { width: 1.25rem; height: 0; border-top: 2px dashed var(--desccolor); }
    .ai-lineChart g[data-tool] .line { stroke: var(--tool-color); }
    .ai-lineChart .dot[data-show="true"] { opacity: 1; }
    .ai-lineChart .gridline span { white-space: nowrap; }
    /* 선(AnimatedChartPath)은 360ms 동안 1-(1-t)^3 으로 보간한다. 점·칸도 같은 곡선이어야 점이 선보다 앞서지 않는다 */
    .ai-lineChart .series > div { transition: left 360ms var(--chart-ease), width 360ms var(--chart-ease), transform 360ms var(--chart-ease); }
    .ai-lineChart .dot { transition: top 360ms var(--chart-ease); }
    /* 막대: 구간 칸 가운데에 두 도구를 나란히 세운다. 끝만 둥글게, 막대 사이는 2px 띄운다 */
    .ai-barGroup { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; gap: 2px; pointer-events: none; }
    .ai-barGroup > span { width: min(18px, 30%); min-height: 0; border-radius: 4px 4px 0 0; background: var(--tool-color); transition: height 360ms cubic-bezier(.22, 1, .36, 1); }
    .ai-barGroup > span[data-empty] { visibility: hidden; }
    .ai-lineChart[data-shape="bar"] .series > div:hover, .ai-lineChart[data-shape="bar"] .series > div:focus-visible { background: var(--control-hover-bg); }
    .ai-lineAxis span { transition: left 360ms var(--chart-ease); }
    /* 구간 날짜는 기록 유무와 상관없이 전부 적는다. 좁은 화면에서 촘촘하면 하나 걸러 적는다 */
    ${mobile} {
        .ai-lineAxis[data-dense] span[data-minor] { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
        .ai-lineChart .series > div, .ai-lineChart .dot, .ai-lineAxis span, .ai-barGroup > span { transition: none; }
    }
    .ai-tableScroll:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 3px; }
    ${mobile} {
        &.ai-page .ai-section, .ai-page .ai-section { margin-top: 2.75rem; gap: 1.25rem; }
        &.ai-page .ai-card, .ai-page .ai-card { padding: 1rem; }
        .ai-process { gap: .75rem; }
        .ai-sectionHeading h2 { font-size: 1.5rem; }
        .ai-toolTotals { gap: .75rem; }
        .ai-toolTotals strong { white-space: normal; overflow-wrap: anywhere; }
        .ai-emptyState { padding: 1.25rem; }
    }
    /* Secondary explanations: an (i) button whose tooltip opens beside it, or below its title row or card when the viewport is narrow. */
    .ai-card, .ai-titleRow { position: relative; }
    .ai-titleRow { display: flex; align-items: center; flex-wrap: wrap; gap: .35rem; }
    /* 제목이 두 줄로 넘어가도 ⓘ 가 혼자 한 줄을 차지하지 않고 마지막 글자 뒤에 붙는다 */
    .ai-sectionHeading > .ai-titleRow { align-self: stretch; display: block; }
    .ai-sectionHeading > .ai-titleRow > :is(h2, h3) { display: inline; }
    .ai-sectionHeading > .ai-titleRow > .ai-info { vertical-align: middle; margin-left: .35rem; }
    .ai-info { display: inline-flex; }
    .ai-infoButton { display: inline-grid; place-items: center; width: 1.6rem; height: 1.6rem; padding: 0; border: 0; border-radius: 50%; background: none; color: var(--desccolor); cursor: help; transition: background-color 150ms, color 150ms; }
    .ai-infoButton svg { width: 1rem; height: 1rem; }
    .ai-infoButton:hover { background: var(--hovercolor); color: var(--hoverfontcolor); }
    .ai-infoButton:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 1px; }
    .ai-infoTip { position: absolute; left: 0; top: calc(100% + .4rem); z-index: 5; width: max-content; max-width: min(24rem, 100%); box-sizing: border-box; padding: .7rem .85rem; border: var(--border-width) solid var(--bordercolor); border-radius: 10px; background: var(--cardbackground); box-shadow: 0 6px 20px var(--shadowcolor); color: var(--foreground); font-size: .8rem; font-weight: normal; line-height: 1.65; letter-spacing: normal; text-align: left; white-space: normal; word-break: keep-all; overflow-wrap: anywhere; opacity: 0; visibility: hidden; transform: translateY(-2px); transition: opacity 150ms, transform 150ms, visibility 150ms; pointer-events: none; }
    .ai-infoTip[data-side] { transform: translateX(-2px); }
    .ai-info:hover .ai-infoTip, .ai-info:focus-within .ai-infoTip { opacity: 1; visibility: visible; transform: none; }
    /* Odometer digits: three 0-9 cycles per place, shifted by --pos thirtieths of the strip. First paint rolls up from the middle 0. */
    .ai-srOnly { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
    .ai-rolling { position: relative; }
    .ai-rollingChars { display: inline-flex; vertical-align: bottom; line-height: 1.25; user-select: none; }
    .ai-digit { position: relative; display: inline-block; height: 1.25em; clip-path: inset(0 -1em); }
    .ai-digitSizer { visibility: hidden; }
    .ai-digitStrip { position: absolute; inset: 0 0 auto; display: flex; flex-direction: column; align-items: center; transform: translateY(calc(var(--pos) * -100% / 30)); transition: transform 700ms cubic-bezier(.22, 1, .36, 1); }
    .ai-digitStrip[data-still] { transition: none; }
    .ai-digitStrip > span { height: 1.25em; }
    @starting-style {
        .ai-digitStrip { transform: translateY(calc(10 * -100% / 30)); }
    }
    @media (prefers-reduced-motion: reduce) {
        .ai-digitStrip, .ai-infoTip { transition: none; }
    }
    /* 클래스는 사용량 쪽(ai-)의 .ai-workspace·.ai-tableScroll 이어야 한다. 관리 쪽(aim-) 같은 이름과 섞으면 표에 걸리지 않는다. */
    /*
     * 스크롤바 자리(scrollbar-gutter: stable, 10px)는 표 밖이라 머리글 띠가 거기서 끊겨 잘린 것처럼 보였다.
     * 머리글 높이를 고정하고, 상자 배경으로 그 자리 맨 위에 같은 띠(위 1px·아래 2px 선 포함)를 칠한다.
     * 스크롤 상자의 배경은 내용과 함께 움직이지 않으므로 sticky 머리글과 늘 맞는다.
     * 막대는 머리글 아래부터 움직이게 트랙을 그 높이만큼 내린다.
     */
    /*
     * 스크롤바 자리(scrollbar-gutter: stable, 10px)는 오른쪽에만 따로 둔다. 표의 좌우 안쪽 여백은 양 끝 칸이 같은 1rem 으로 맡고,
     * 스크롤바는 그 바깥 제 자리에서 움직여 마지막 칸 글자에 붙지 않는다.
     * 비운 자리는 표 밖이라 머리글 띠가 거기서 끊기므로, 상자 배경으로 그 자리 맨 위에 같은 띠(위 1px·아래 2px 선 포함)를 칠한다.
     * 막대는 머리글 아래부터 움직이게 트랙을 그 높이만큼 내린다.
     */
    .ai-workspace .ai-tableScroll { --thead-h: 2.5rem; background:
    linear-gradient(to bottom, var(--bordercolor) 0 var(--border-width), var(--codefontbgcolor) var(--border-width) calc(100% - 2px), var(--bordercolor) calc(100% - 2px)) right top / 10px var(--thead-h) no-repeat,
    var(--cardbackground); }
    .ai-workspace .ai-tableScroll th { height: var(--thead-h); box-sizing: border-box; padding-block: 0; white-space: nowrap; }
    .ai-workspace .ai-tableScroll::-webkit-scrollbar-track { margin-top: var(--thead-h); }
    .ai-tableNote { margin: 0; flex-shrink: 0; }
    /*
     * 좁은 관리 화면은 페이지가 스크롤한다(아래 관리 쪽 규칙). 상자는 내용 높이대로 펼친다.
     * 사용량 표는 압축 표(AiUsageView 의 NarrowHead)라 가로로 넘치지 않는다. 그래서 상자를 스크롤 상자가 아닌
     * overflow: clip 으로 두어(둥근 모서리만 자른다) 머리글이 페이지 기준으로 필터 바 아래(--filter-bottom, AiFilterBar)에 붙는다.
     */
    .ai-narrowCol, .ai-cellSub, .ai-weekRow { display: none; }
    ${mobile} {
        .ai-workspace .ai-tableScroll, .ai-workspace .ai-contentScroll { flex: none; }
        .ai-workspace .ai-tableScroll { overflow: clip; scrollbar-gutter: auto; background: var(--cardbackground); }
        .ai-workspace .ai-contentScroll { overflow: visible; }
        .ai-workspace .ai-wideCol { display: none; }
        .ai-workspace .ai-narrowCol { display: table-cell; }
        .ai-workspace .ai-tableScroll table th { top: var(--filter-bottom, 0px); height: auto; min-height: var(--thead-h); padding-block: .45rem; }
        .ai-workspace .ai-tableScroll td { white-space: normal; overflow-wrap: anywhere; }
        .ai-workspace .ai-tableScroll :is(th, td) { width: auto; padding-inline: .75rem; }
        .ai-workspace .ai-tableScroll td[data-center] { white-space: nowrap; }
        .ai-workspace .ai-cellSub { display: block; margin-top: .15rem; color: var(--desccolor); font-size: .72rem; line-height: 1.45; word-break: keep-all; }
        .ai-numStack { display: grid; gap: .15rem; justify-items: end; white-space: nowrap; }
        /* 프로젝트별 표의 주 구분 줄. 주 열을 숨긴 대신 날짜가 바뀌는 곳에 한 번만 적는다 */
        .ai-workspace .ai-weekRow { display: table-row; }
        .ai-workspace .ai-weekRow td { padding-block: .5rem .35rem; background: var(--background); color: var(--desccolor); font-size: .75rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        th .ai-numStack { font-size: .68rem; line-height: 1.3; }
    }

    /* ── 관리 작업 기록 (aim-) ── */
    &.aim-shell, .aim-shell { height: 100dvh; box-sizing: border-box; max-width: 1200px; margin: auto; padding: 4.75rem 1.25rem max(.75rem, env(safe-area-inset-bottom)); display: flex; min-width: 0; }
    .aim-workspace { position: relative; gap: 1rem; }
    /* 공용 FilterBar 를 화면 고정 골격 안에 맞춘다. 바깥 여백은 workspace gap 이 맡는다 */
    .aim-filterBar { flex-shrink: 0; min-width: 0; }
    .aim-filterBar > div { margin-bottom: 0; }
    .aim-periodControls { display: flex; flex-wrap: wrap; gap: 8px; }
    .aim-empty { margin: 0; padding: 2.5rem 1rem; text-align: center; color: var(--desccolor); font-size: .85rem; }
    ${mobile} {
        &.aim-shell, .aim-shell { padding: 4.5rem .75rem max(.75rem, env(safe-area-inset-bottom)); }
        .aim-workspace { gap: .75rem; }
        .aim-quality table, .aim-quality tbody, .aim-quality tr, .aim-quality td { display: block; width: auto; }
        .aim-quality thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
        .aim-quality tr { padding: .5rem .75rem; border-bottom: var(--border-width) solid var(--bordercolor); }
        .aim-quality td { display: grid; grid-template-columns: 6rem minmax(0, 1fr); gap: .5rem; min-width: 0; max-width: none; padding: .35rem 0; border: 0; text-align: left; }
        .aim-quality td::before { content: attr(data-label); color: var(--desccolor); }
        .aim-quality td[data-number] { text-align: left; }
    }
    @media (max-height: 500px) {
        &.aim-shell, .aim-shell { padding-top: 4.25rem; padding-bottom: .5rem; }
        .aim-workspace { gap: .3rem; }
    }
    /* 넓은 화면은 화면 높이에 맞춘 골격 안에서 표만 스크롤한다. 페이지 스크롤과 푸터는 걷는다 */
    ${desktop} {
        body:has(&.aim-shell) { overflow: hidden; }
        body:has(&.aim-shell) footer { display: none; }
    }
    /*
     * 좁은 화면은 블로그 관리와 같이 페이지 하나로 스크롤한다(Admin.styled 의 AdminListScroll 주석).
     * 골격 높이를 풀고 표·목록 상자의 세로 스크롤을 걷는다(표 상자는 위 사용량 쪽 규칙). 필터는 헤더(64px) 아래에 붙고, 목록이 끝나면 푸터가 이어진다.
     * 넓은 표는 가로로만 제 안에서 스크롤한다.
     */
    ${mobile} {
        &.aim-shell, .aim-shell { height: auto; min-height: 100dvh; }
        .aim-filterBar { position: sticky; top: 64px; z-index: 10; }
    }
    .aim-summaryCards { flex-shrink: 0; min-width: 0; }
    .aim-summaryCards > div > div { padding: .55rem .75rem; border-radius: 10px; }
    .aim-workspace .aim-summaryCards strong { margin-top: .2rem; font-size: clamp(.85rem, 1.5vw, 1.15rem); }
    ${mobile} {
        .aim-summaryCards > div { gap: .4rem; }
        .aim-summaryCards > div > div { padding: .45rem .6rem; }
        .aim-workspace .aim-summaryCards strong { font-size: .95rem; }
    }
    /* 좁은 화면의 한 줄 필터는 공용 FilterBar 가 맡는다. 여기서는 기간 줄을 줄이고 표 구성 전환을 필터 시트로 보낸다(AiFilterBar) */
    .aim-narrowLabel { display: none; }
    ${mobile} {
        .aim-wideLabel { display: none; }
        .aim-narrowLabel { display: inline; }
        .aim-filterBar .aim-viewToggle { display: none; }
        .aim-filterBar .bar-status .status-filters button { flex: 1 1 0; min-width: 0; padding-inline: 4px; }
    }
    /* Admin tables share the blog's list-table header: a tinted band with body-coloured, centred text, so it never reads as a first row. */
    .aim-workspace table th { background: var(--codefontbgcolor); color: var(--foreground); font-size: .75rem; font-weight: 800; letter-spacing: .03em; box-shadow: inset 0 1px 0 var(--bordercolor), inset 0 -2px 0 var(--bordercolor); border-bottom: 0; text-align: center; }
    /* Number cells stay right-aligned. */
    .aim-workspace table td[data-number] { text-align: right; font-variant-numeric: tabular-nums; }
    /* Quality tab: one card per table, like the analytics panels. */
    /* 펼친 내역으로 세로 스크롤바가 생겨도 폭이 줄지 않게 자리를 미리 잡는다 */
    /* 펼친 내역으로 세로 스크롤바가 생겨도 폭이 줄지 않게 자리를 잡되, 양쪽에 같은 폭으로 잡아 카드 좌우 여백이 같다.
       스크롤바가 화면 위에 겹치는 기기(대부분의 휴대폰)에서는 양쪽 다 0 이라 위 필터 바와 줄이 맞는다 */
    .aim-quality { display: grid; gap: .75rem; align-content: start; scrollbar-gutter: stable both-edges; }
    .aim-workspace .aim-quality { padding-inline: 0; }
    .aim-qualityPanel { display: grid; gap: .75rem; min-width: 0; padding: 1rem; border: var(--border-width) solid var(--bordercolor); border-radius: 12px; background: var(--cardbackground); }
    .aim-qualityPanel header h3 { margin: 0; font-size: 1rem; letter-spacing: -.02em; }
    .aim-qualityPanel header p { margin: .25rem 0 0; }
    .aim-qualityTable { overflow-x: auto; min-width: 0; }
    .aim-qualityTable table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: .85rem; }
    .aim-qualityTable th, .aim-qualityTable td { padding: .65rem .6rem; white-space: nowrap; }
    .aim-qualityTable td { text-align: left; }
    /* Fixed-format or short values (dates, type, status, rework) sit under their centred header, as in the post list table. */
    .aim-qualityTable td[data-center] { text-align: center; }
    .aim-qualityTable td[data-center] .aim-badges { justify-content: center; }
    .aim-qualityTable td { border-bottom: var(--border-width) solid var(--bordercolor); vertical-align: top; }
    .aim-qualityTable tbody tr:last-child td { border-bottom: 0; }
    .aim-badges { display: flex; flex-wrap: wrap; gap: .25rem; }
    ${mobile} {
        .aim-qualityPanel { padding: .75rem; }
        .aim-qualityTable td { padding: .35rem 0; border: 0; white-space: normal; }
        .aim-qualityTable tbody tr:last-child { border-bottom: 0; }
        .aim-workspace .aim-qualityTable td[data-number], .aim-qualityTable td[data-center] { text-align: left; }
        .aim-qualityTable td[data-center] .aim-badges { justify-content: flex-start; }
        .aim-quality tr[data-open] { border-bottom: 0; }
        .aim-quality .aim-diagTable tbody { display: grid; gap: .6rem; }
        .aim-quality .aim-diagTable tr { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .55rem .5rem; padding: .7rem .8rem; border: var(--border-width) solid var(--bordercolor); border-radius: 10px; background: var(--recordbackground); }
        .aim-quality .aim-diagTable tbody tr:last-child { border-bottom: var(--border-width) solid var(--bordercolor); }
        .aim-quality .aim-diagTable td { display: flex; flex-direction: column; gap: .1rem; padding: 0; font-variant-numeric: tabular-nums; }
        .aim-quality .aim-diagTable td::before { font-size: .7rem; line-height: 1.3; }
        /* 카드 첫 줄은 주만 굵게 한 줄 전체에 둔다 */
        .aim-quality .aim-diagTable td:first-child { grid-column: 1 / -1; font-weight: 700; }
        .aim-quality .aim-diagTable td:first-child::before { content: none; }
        .aim-quality .aim-diagTable td:last-child { grid-column: span 2; }
    }
    /* 불러오는 동안의 자리. 카드·표는 실제 클래스를 그대로 써서 도착할 때 상자가 움직이지 않는다 */
    .aim-loadingUsage { display: flex; flex-direction: column; gap: .5rem; flex: 1; min-height: 0; }
    .aim-loadingUsage table { pointer-events: none; table-layout: fixed; }
    .aim-loadingRows { display: grid; gap: .9rem; }
    .aim-loadingRows > span { display: flex; justify-content: space-between; gap: 1rem; }
    /* 진단에는 목적과 적용 범위를 함께 표시한다. */
    .aim-qualityPanel header .aim-scope { margin-top: .4rem; font-size: .75rem; line-height: 1.6; color: var(--desccolor); overflow-wrap: anywhere; }
    .aim-metricGuide { min-width: 0; font-size: .82rem; }
    .aim-metricGuide summary { width: fit-content; color: var(--foreground); }
    .aim-metricGuide dl { display: grid; gap: .7rem; margin: .6rem 0 0; padding: .75rem; border: var(--border-width) solid var(--bordercolor); border-radius: 8px; }
    .aim-metricGuide dt { font-weight: 700; }
    .aim-metricGuide dd { margin: .2rem 0 0; line-height: 1.65; color: var(--desccolor); }
    .aim-collectionSummary { margin: 0; font-size: .8rem; line-height: 1.6; color: var(--desccolor); }
    .aim-collectionSummary strong { color: var(--foreground); font-variant-numeric: tabular-nums; }
    .aim-problemList { display: grid; gap: .65rem; margin: 0; padding-left: 1.25rem; font-size: .8rem; line-height: 1.6; overflow-wrap: anywhere; }
    .aim-problemList span { display: block; color: var(--desccolor); }
    .aim-diagTable td { vertical-align: middle; }
    /*
     * 관측 범위는 날짜 오른쪽 아이콘으로 표시한다. 아이콘은 폭을 차지하지 않으므로(absolute), 표시가 있든 없든 날짜는 열 가운데에
     * 있고 열 폭도 같다. 옆 칸(숫자, 오른쪽 정렬)의 빈 왼쪽 여백에 걸친다.
     * 부분 관측은 앰버 원에 반원(14px 에서 고리는 빈 원처럼 보여 반원만 판다), 진행 중은 파란 원 시계, 미관측은 회색 원 빼기다(모두 채운 원에 바탕색 기호를 파낸다)
     */
    /* 좁은 화면 카드에서는 칸이 flex 라 늘어나지 않게 글자 폭으로 둔다. 그래야 아이콘이 날짜 바로 옆에 온다 */
    .aim-weekMarked { position: relative; align-self: flex-start; }
    /* 글자 상자 가운데는 숫자 획의 가운데보다 0.5px 위라(NanumSquareNeo 13.6px 실측) 그만큼 내린다 */
    .aim-weekMarked .aim-scopeMark { position: absolute; left: 100%; top: 50%; margin: calc(.5px - .45rem) 0 0 .4rem; }
    .aim-scopeMark { display: block; flex: none; width: .9rem; height: .9rem; }
    .aim-scopeMark [data-part="mark"] { fill: none; stroke: var(--cardbackground); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
    .aim-scopeMark [data-part="markFill"] { fill: var(--cardbackground); }
    .aim-scopeMark[data-scope="partial"] [data-part="face"] { fill: var(--warnicon); }
    .aim-scopeMark[data-scope="running"] [data-part="face"] { fill: var(--progresscolor); }
    .aim-scopeMark[data-scope="missing"] [data-part="face"] { fill: var(--desccolor); }
    .aim-scopeLegend { display: flex; flex-wrap: wrap; align-items: center; gap: .25rem .75rem; }
    .aim-scopeLegend > span { display: inline-flex; align-items: center; gap: .35rem; }
    /*
     * 주 열은 날짜 폭(width: 1%)만 갖고, 남는 폭은 숫자 열 일곱이 같은 몫으로 나눈다. 가운데 정렬된 날짜가 열을 꽉 채워
     * 날짜 왼쪽 여백과 마지막 숫자 오른쪽 여백이 같아진다. 열이 넓으면 가운데 정렬 때문에 왼쪽만 크게 벌어진다.
     */
    .aim-diagTable th:first-child { width: 1%; }
    .aim-diagTable th:not(:first-child) { width: 14%; }
    /*
     * 좁은 PC 폭(641px~)에서는 머리글(반복 호출 · 미분류 토큰 등)이 두 줄로 접혀 표가 상자 안에 든다. 넓으면 한 줄 그대로다.
     * 접을 때는 띄어쓰기에서만 접는다(keep-all). 기본값은 한글 글자 사이 어디서나 끊어 '반복 호 / 출' 이 된다
     */
    .aim-diagTable thead th { white-space: normal; word-break: keep-all; }
    /*
     * 기간을 '연도 전체'로 두면 행이 최대 53개다. 표 상자 안에서만 스크롤하고 머리글을 붙여 두어
     * 아래 '자료 누락 확인' 패널이 행 수만큼 밀려 내려가지 않게 한다. 좁은 화면은 카드로 바뀌어 페이지가 스크롤한다
     */
    ${desktop} {
        .aim-diagScroll { max-height: 26rem; overflow-y: auto; }
        .aim-diagScroll thead th { position: sticky; top: 0; z-index: 1; }
    }
    /*
     * 기기 이름은 한 줄로 둔다. 아무 데서나 끊을 수 있게 두면 자동 표 배치가 이 열을 가장 먼저 줄여서
     * 날짜 열에 자리가 남는데도 이름만 두 줄이 되고 행 높이가 어긋난다. 자리가 모자라면 관측 시각이 날짜·시각 두 줄로 접힌다
     */
    .aim-deviceTable td:first-child { white-space: nowrap; }
    .aim-deviceTable td[data-label^="관측"] { white-space: normal; }
    .aim-deviceTable td[data-label^="관측"] > span > span { white-space: nowrap; }
    /* 한 칸이 두 줄이 되면 한 줄짜리 칸은 그 가운데에 맞춘다 */
    .aim-qualityTable .aim-deviceTable td { vertical-align: middle; }
    ${mobile} {
        .aim-deviceTable td:first-child { white-space: normal; overflow-wrap: anywhere; }
        .aim-qualityPanel { gap: .65rem; padding: .75rem; }
    }
    ${mobile} {
        .aim-quality .aim-deviceTable td[data-meta] { align-items: center; }
    }
    .aim-summaryLine { display: inline-flex; align-items: center; flex-wrap: wrap; gap: .3rem; }
    .aim-records { flex: 1; min-height: 0; max-height: none; padding: 0; border: var(--border-width) solid var(--bordercolor); border-radius: 12px; }
    .aim-recordTable { width: 100%; }
    .aim-recordTable th:first-child { width: 42%; }
    .aim-recordTable th:nth-child(2) { width: 20%; }
    .aim-recordTable th:nth-child(3) { width: 13%; }
    .aim-recordTable th:nth-child(4) { width: 15%; }
    .aim-recordTable th:nth-child(5) { width: 10%; }
    .aim-recordTable td { overflow-wrap: anywhere; }
    .aim-recordTable td[data-center] { text-align: center; }
    .aim-recordTable tr:not(.aim-recordDetail) { cursor: pointer; }
    .aim-recordTable tr:not(.aim-recordDetail):hover, .aim-recordTable tr[data-open] { background: var(--codefontbgcolor); }
    .aim-recordToggle { display: flex; align-items: center; justify-content: flex-start; gap: .4rem; width: 100%; min-height: 28px; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--foreground); background: transparent; text-align: left; cursor: pointer; }
    /* 줄 높이를 펼침 전후 같게 둔다. 바뀌면 첫 줄 글자가 상자 안에서 위아래로 튀어 펼칠 때 살짝 올라갔다 내려온다 */
    .aim-recordToggle span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; }
    .aim-recordChevron { flex-shrink: 0; transition: transform 150ms; }
    .aim-recordToggle:hover { color: var(--linkhovercolor); }
    .aim-recordToggle:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 4px; border-radius: 3px; }
    .aim-recordSummary { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: .1rem 0 0 1.4rem; color: var(--desccolor); font-size: .8rem; line-height: 1.65; }
    .aim-recordSections { display: grid; gap: 1rem; overflow-wrap: anywhere; }
    .aim-recordSections h4 { margin: 0 0 .4rem; font-size: .85rem; }
    .aim-recordSections p { margin: .25rem 0 0; font-size: .875rem; line-height: 1.8; }
    .aim-recordReason, .aim-rawRecord { color: var(--desccolor); }
    .aim-rawRecord { font-size: .8rem; line-height: 1.7; }
    .aim-rawRecord dl { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: .3rem .75rem; margin: .2rem 0 0; }
    .aim-rawRecord dd { margin: 0; color: var(--foreground); overflow-wrap: anywhere; }
    ${mobile} {
        .aim-recordTable, .aim-recordTable tbody { display: block; }
        .aim-recordTable thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
        .aim-recordTable tr:not(.aim-recordDetail) { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem .75rem; padding: .75rem .5rem; margin-bottom: .75rem; border: var(--border-width) solid var(--bordercolor); border-radius: 12px; background: var(--cardbackground); }
        .aim-recordTable td { display: block; padding: 0; border: 0; min-width: 0; }
        .aim-recordTable td:first-child { flex-basis: 100%; }
        .aim-recordTable td:not(:first-child) { font-size: .75rem; color: var(--desccolor); }
        .aim-recordTable td[data-center] { text-align: left; }
        .aim-recordTable tr[data-open] { border-radius: 0; border-bottom: 0; }
        .aim-recordDetail { display: block; padding: .8rem; border: 0; border-bottom: var(--border-width) solid var(--bordercolor); border-radius: 0; background: var(--codefontbgcolor); }
    }
    .aim-titleWithInfo { display: flex; align-items: center; gap: .35rem; }
    .aim-loadingRecord { padding: .8rem; border-bottom: var(--border-width) solid var(--bordercolor); }
    .aim-loadingRecord > span { display: flex; gap: 1rem; }
    .aim-loadingRecord p { margin: .5rem 0; }
    .aim-dateBasis { display: block; margin-top: .3rem; color: var(--desccolor); font-size: .72rem; }
    .aim-recordProject { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .8rem; line-height: 1.6; color: var(--desccolor); }
    /* 좁은 PC 폭. 작업 상태 칸은 "부분 완료" 배지(65px)와 칸 여백이 들어갈 만큼(15%) 잡는다 — 641px 에서 11% 면 배지가 칸 밖으로 6px 밀려 가로 스크롤이 생겼다 */
    ${desktop} and (max-width: 1100px) {
        .aim-recordTable th:first-child { width: 32%; }
        .aim-recordTable th:nth-child(2) { width: 21%; }
        .aim-recordTable th:nth-child(3) { width: 15%; }
        .aim-recordTable th:nth-child(4) { width: 17%; }
        .aim-recordTable th:nth-child(5) { width: 15%; }
        .aim-recordTable td { padding-inline: .4rem; }
    }
    ${mobile} {
        .aim-recordTable td:nth-child(2) { flex-basis: 100%; padding-left: 1.4rem; }
        .aim-recordTable td:nth-child(3) { margin-left: 1.4rem; }
        .aim-recordTable td:nth-child(4) { margin-right: auto; }
    }
    .aim-linkedTask { margin-bottom: 1rem; border: var(--border-width) solid var(--bordercolor); border-radius: 8px; }
    .aim-linkedTask > div { display: flex; justify-content: space-between; gap: 1rem; padding: .7rem; }
    .aim-linkedTask button { cursor: pointer; }
    .aim-linkedTask > div > button { padding: .35rem .7rem; border: var(--border-width) solid var(--bordercolor); border-radius: 6px; color: var(--foreground); background: var(--background); }
    .aim-linkedTask > div > button:hover { color: var(--hoverfontcolor); background: var(--hovercolor); }
    ${mobile} {
        .aim-recordTable tr:not(.aim-recordDetail):hover { background: var(--cardbackground); border-color: var(--desccolor); }
        .aim-recordTable tr[data-open] { margin-bottom: 0; border-radius: 12px 12px 0 0; }
        .aim-recordDetail { border: var(--border-width) solid var(--bordercolor); border-top: 0; border-radius: 0 0 12px 12px; margin-bottom: .75rem; }
    }
    /* 좁은 화면의 작업 기록은 행마다 카드라 바깥 상자 테두리를 걷는다. 겹치면 테두리가 두 겹으로 보인다 */
    ${mobile} {
        .aim-records { border: 0; border-radius: 0; }
    }
    /* 수집 상태 탭의 카드 가장자리를 필터 바·탭 밑줄과 맞춘다. 위아래 여백만 포커스 테두리 자리로 남긴다 */
    .aim-workspace .aim-statusScroll { padding-inline: 0; }
    .aim-statusScroll .aim-quality { scrollbar-gutter: auto; }
    /* 작업 기록 표의 양 끝 칸 안쪽 여백을 사용량 표와 같은 1rem 으로 맞춘다. 스크롤바는 그 바깥 제 자리에 있다 */
    ${desktop} {
        .aim-recordTable th:first-child, .aim-recordTable td:first-child { padding-left: 1rem; }
        .aim-recordTable th:last-child, .aim-recordTable td:last-child { padding-right: 1rem; }
    }
    /*
     * 상세 안의 접힘(원본 기록과 근거·작업 근거·인계 식별자·지표 뜻)은 모두 같은 모양의 누를 수 있는 줄이다.
     * 기본 삼각형 대신 회전하는 꺾쇠, 호버 면은 --hovercolor + --hoverfontcolor(다크에서도 면이 밝아지므로 글자를 어둡게).
     */
    .aim-recordSections details > summary, .aim-metricGuide > summary { display: inline-flex; align-items: center; gap: .45rem; width: fit-content; margin-left: -.6rem; padding: .4rem .6rem; border-radius: 6px; color: var(--foreground); font-size: .82rem; font-weight: 600; cursor: pointer; list-style: none; transition: background-color 150ms ease, color 150ms ease; }
    .aim-recordSections details > summary::-webkit-details-marker, .aim-metricGuide > summary::-webkit-details-marker { display: none; }
    .aim-recordSections details > summary::before, .aim-metricGuide > summary::before { content: ""; width: .4rem; height: .4rem; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(-45deg); transition: transform 150ms ease; }
    .aim-recordSections details[open] > summary::before, .aim-metricGuide[open] > summary::before { transform: rotate(45deg); }
    .aim-recordSections details > summary:hover, .aim-metricGuide > summary:hover { background: var(--hovercolor); color: var(--hoverfontcolor); }
    /* 원본 기록은 상세의 맨 끝에 둔다 */
    .aim-rawRecord[open] > summary { margin-bottom: .5rem; }
    @media (prefers-reduced-motion: reduce) {
        .aim-recordSections details > summary, .aim-recordSections details > summary::before, .aim-metricGuide > summary, .aim-metricGuide > summary::before { transition: none; }
    }
    /*
     * 작업 상세: 한 줄 요약 → 이름·값 줄(가는 구분선으로 나눔) → 맨 끝 원본·근거 하나.
     * 상세는 행 아래 한 톤 다른 면(--recordbackground) 위에 놓고, 줄 사이에는 읽을 만큼의 숨을 둔다.
     */
    .aim-recordTable .aim-recordDetail > td { padding: 0; background: var(--recordbackground); }
    /* 상세 펼침: 높이 0 → 내용 높이(grid 0fr → 1fr)와 함께 옅게 나타나고, 닫을 때는 거꾸로 접힌다 */
    .aim-detailBody { display: grid; grid-template-rows: 1fr; opacity: 1; transition: grid-template-rows 220ms ease, opacity 180ms ease; }
    .aim-detailBody > div { min-height: 0; overflow: hidden; }
    .aim-detailBody .aim-recordSections { padding: 1.25rem 1.5rem 1.4rem; }
    @starting-style {
        .aim-detailBody { grid-template-rows: 0fr; opacity: 0; }
    }
    .aim-recordDetail[data-closing] .aim-detailBody { grid-template-rows: 0fr; opacity: 0; }
    @media (prefers-reduced-motion: reduce) {
        .aim-detailBody { transition: none; }
    }
    .aim-recordSections p.aim-recordLead { margin: 0; font-size: .95rem; line-height: 1.75; color: var(--foreground); }
    .aim-recordSections p.aim-recordReason { margin: 0; font-size: .82rem; }
    .aim-facts { display: grid; grid-template-columns: 7rem minmax(0, 1fr); margin: 0; font-size: .86rem; line-height: 1.7; border-top: var(--border-width) solid var(--bordercolor); }
    .aim-fact { display: contents; }
    .aim-fact > dt, .aim-fact > dd { padding: .75rem 0; border-bottom: var(--border-width) solid var(--bordercolor); }
    /* 이름 줄 높이를 값의 첫 줄(.86rem × 1.7)과 같게 두어 두 열 글자의 가운데가 맞는다 */
    .aim-fact > dt { padding-right: 1rem; color: var(--desccolor); font-size: .78rem; font-weight: 600; letter-spacing: .01em; line-height: calc(.86rem * 1.7); }
    /* 값이 카드(인계)로 시작하면 이름을 카드 첫 줄 높이로 내린다 */
    .aim-fact:has(.aim-handoff) > dt { padding-top: calc(.75rem + .85rem + var(--border-width)); }
    .aim-fact > dd { margin: 0; min-width: 0; overflow-wrap: anywhere; word-break: keep-all; }
    .aim-fact > dd small, .aim-factList small, .aim-checkList small, .aim-handoff small { display: block; margin-top: .1rem; color: var(--desccolor); font-size: .77rem; line-height: 1.6; }
    .aim-factEmpty { color: var(--desccolor); }
    .aim-factSub { margin-top: .45rem !important; }
    /* 여러 줄 목록은 작은 점으로 줄머리를 잡는다 */
    .aim-factList { display: grid; gap: .35rem; margin: 0; padding: 0; list-style: none; }
    .aim-factList > li { position: relative; padding-left: .9rem; }
    .aim-factList > li::before { content: ""; position: absolute; left: .1rem; top: .72em; width: 4px; height: 4px; border-radius: 50%; background: var(--desccolor); }
    .aim-factTags { display: inline-flex; flex-wrap: wrap; align-items: center; gap: .4rem; margin-right: .5rem; vertical-align: middle; }
    .aim-factCode { font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: .78rem; overflow-wrap: anywhere; }
    .aim-checkList { display: grid; gap: .55rem; margin: 0; padding: 0; list-style: none; }
    .aim-checkList > li { display: flex; align-items: flex-start; gap: .6rem; min-width: 0; }
    /* 배지는 오른쪽 글의 첫 줄 가운데에 맞춘다(줄 높이 1.7em, 배지 1.375rem) */
    .aim-checkList > li > [data-tone] { flex-shrink: 0; margin-top: calc((1.7em - 1.375rem) / 2 + .1em); }
    .aim-checkList > li > span:first-child { flex-shrink: 0; }
    .aim-checkList > li > span:last-child { min-width: 0; }
    /* 인계: 표면 위 흰 카드 하나, 이벤트는 점과 세로선으로 잇는 타임라인 */
    .aim-handoff { padding: .85rem 1rem; border: var(--border-width) solid var(--bordercolor); border-radius: 10px; background: var(--cardbackground); }
    .aim-handoff + .aim-handoff { margin-top: .6rem; }
    .aim-handoffState { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
    .aim-handoffHeader { margin-top: .55rem; }
    .aim-handoffRoute { display: flex; flex-wrap: wrap; align-items: baseline; gap: .3rem .6rem; }
    .aim-handoffEnd { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: .1rem .5rem; min-width: 0; overflow-wrap: anywhere; }
    .aim-handoffRoute > .aim-handoffTo { flex-wrap: nowrap; }
    .aim-handoffTo { display: inline-flex; align-items: baseline; gap: .45rem; min-width: 0; }
    .aim-handoffTo > span:last-child { min-width: 0; }
    .aim-handoffArrow { color: var(--desccolor); }
    .aim-handoffEvents { margin: .8rem 0 .2rem; padding: 0; list-style: none; }
    .aim-handoffEvents > li { position: relative; margin: 0; padding: 0 0 .75rem 1.1rem; }
    .aim-handoffEvents > li:last-child { padding-bottom: 0; }
    .aim-handoffEvents > li::before { content: ""; position: absolute; left: 0; top: .55em; width: 7px; height: 7px; border-radius: 50%; background: var(--cardbackground); border: 1.5px solid var(--desccolor); box-sizing: border-box; }
    .aim-handoffEvents > li:not(:last-child)::after { content: ""; position: absolute; left: 3px; top: calc(.55em + 9px); bottom: 2px; width: 1px; background: var(--bordercolor); }
    .aim-handoffEvents > li > span { display: block; }
    .aim-eventHead { display: flex !important; flex-wrap: wrap; align-items: baseline; gap: .1rem .5rem; }
    .aim-eventHead > span { color: var(--desccolor); font-size: .74rem; }
    .aim-handoff details { margin-top: .6rem; }
    /* 포트폴리오와 같은 공용 링크 모양(styles/link.ts). 버튼이라 기본 모양만 걷고 글자색 전환을 더한다 */
    .aim-handoffLink { ${animatedLink} display: inline; padding: 0 0 1px; border-top: 0; border-inline: 0; background: none; color: var(--foreground); font: inherit; font-size: .84rem; font-weight: 600; text-align: left; cursor: pointer; transition: color 150ms ease; }
    .aim-handoffLink:is(:hover, :focus-visible) { color: var(--linkhovercolor); }
    .aim-handoffLink:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 4px; border-radius: 3px; }
    ${mobile} {
        /* 카드 안에 다시 상자를 두지 않는다. 펼친 상세는 카드 안쪽 여백 하나만 쓴다 */
        .aim-recordDetail { padding: 0; }
        .aim-recordTable .aim-recordDetail > td { padding: 0; border-radius: 0 0 12px 12px; overflow: hidden; }
        .aim-detailBody .aim-recordSections { padding: 1rem 1rem 1.1rem; }
        .aim-facts { grid-template-columns: minmax(0, 1fr); }
        .aim-fact > dt { padding: .7rem 0 0; border-bottom: 0; font-size: .74rem; line-height: 1.6; }
        .aim-fact:has(.aim-handoff) > dt { padding-top: .7rem; }
        .aim-fact > dd { padding: .15rem 0 .7rem; }
        .aim-handoff { padding: .75rem .8rem; }
        .aim-rawRecord dl { grid-template-columns: minmax(0, 1fr); gap: 0; }
        .aim-rawRecord dd + dt { margin-top: .5rem; }
    }
    /* 인계 링크로 찾아온 행: 머리글 아래에 멈추고, 강조색이 잠깐 비쳤다가 사라진다 */
    .aim-recordTable tbody tr { scroll-margin-top: 2.5rem; }
    .aim-recordTable tr[data-flash] { animation: aim-recordFlash 2.2s ease-out both; }
    /* 도착한 순간 가장 진하고, 잠깐 머문 뒤 서서히 사라진다 */
    @keyframes aim-recordFlash {
        0%, 30% { box-shadow: inset 3px 0 0 var(--linkhovercolor); background-color: color-mix(in srgb, var(--linkhovercolor) 16%, transparent); }
        100% { box-shadow: inset 3px 0 0 transparent; }
    }
    @media (prefers-reduced-motion: reduce) {
        .aim-recordTable tr[data-flash] { animation: none; box-shadow: inset 3px 0 0 var(--linkhovercolor); }
    }
    .aim-linkedTask strong small { display: block; margin-top: .1rem; color: var(--desccolor); font-size: .74rem; font-weight: 400; }
    /* 좁은 화면의 작업 기록은 머리글을 숨긴 카드 목록이라, 스크롤바 자리 위에 칠하던 머리글 띠와 트랙 여백을 걷는다 */
    ${mobile} {
        .aim-workspace .aim-records { background: none; }
        .aim-workspace .aim-records::-webkit-scrollbar-track { margin-top: 0; }
        .aim-recordTable tbody tr { scroll-margin-top: .5rem; }
    }
    /* 기간·보기 방식 두 묶음이 블로그 목록보다 넓어, 검색 기본 폭을 줄여야 641~700px 에서도 정렬이 홀로 다음 줄로 떨어지지 않는다 */
    ${desktop} {
        .aim-filterBar .bar-main { flex-basis: 170px; }
    }
    .aim-rawRecord dd small { display: block; margin-top: .1rem; color: var(--desccolor); font-size: .76rem; line-height: 1.6; }
    /* 펼친 동안 행의 한 줄 요약은 상세 맨 위로 옮겨 간다(아래 규칙에서 그 자리를 제목이 쓴다) */
    .aim-recordSections p.aim-recordLead small, .aim-recordSections p.aim-recordReason small { display: block; margin-top: .2rem; color: var(--desccolor); font-size: .78rem; }
    /*
     * 펼친 동안: 요약 줄을 빼고 그 자리까지 제목이 두 줄로 펼쳐진다. 버튼 최소 높이를 '제목 한 줄 + 요약 줄'로 잡아
     * 한 줄 제목은 그 가운데에, 긴 제목은 두 줄로 다 보인다. 어느 쪽이든 행 높이는 닫혔을 때와 같다.
     */
    .aim-recordTable tr[data-open] .aim-recordToggle { min-height: calc(28px + .1rem + .8rem * 1.65); }
    .aim-recordTable tr[data-open] .aim-recordToggle > span { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; white-space: normal; }
    .aim-recordTable tr[data-open] .aim-recordSummary { display: none; }
    /* KB 적용 이력 대조: 판단 목록 아래 가는 선으로 나눈 시도 목록. 시도마다 상태·원본 일치·시각, 그 아래 문서별 결과 */
    .aim-reviewHistory { margin-top: .75rem; padding-top: .65rem; border-top: var(--border-width) dashed var(--bordercolor); }
    .aim-reviewTitle { margin: 0 0 .45rem !important; }
    .aim-reviewList { display: grid; gap: .8rem; margin: 0; padding: 0; list-style: none; }
    .aim-reviewList > li > .aim-checkList { margin-top: .45rem; }
`;
