"use client";

import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";

/**
 * 관리 > 통계 화면. 여러 컴포넌트(기간 카드·결과·차트·도움말·로딩·오류)가 같은 클래스를 나눠 쓰므로
 * 화면의 뿌리 하나에 규칙을 모으고 안쪽은 `an-` 접두사 클래스로 고른다. 접두사는 공용 조각의 .empty·.note 같은
 * 흔한 이름과 섞이지 않게 하려는 것이다. 뿌리 자신이 dashboard·panel 일 때를 위해 `&.an-…` 대안을 함께 둔다.
 */
export const AnalyticsRoot = styled.div`
    &.an-dashboard, .an-dashboard { display:grid; gap:24px; min-width:0; color:var(--foreground); }
    &.an-dashboard section, .an-dashboard section, &.an-dashboard article, .an-dashboard article, &.an-dashboard form, .an-dashboard form, &.an-dashboard figure, .an-dashboard figure { min-width:0; }
    &.an-panel, .an-panel { margin:0; padding:20px; border:var(--border-width) solid var(--bordercolor); border-radius:12px; background:var(--cardbackground); min-width:0; }
    &.an-panel h3, .an-panel h3 { margin:0; font-size:16px; }
    .an-toolbar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; }
    .an-dates { flex:0 1 auto; display:grid; grid-template-columns:repeat(2,minmax(0,150px)); align-items:end; gap:8px; min-width:0; }
    .an-dates label { min-width:0; display:grid; gap:5px; font-size:12px; color:var(--desccolor); }
    .an-dates input { width:100%; box-sizing:border-box; min-width:0; max-width:100%; padding:8px; border:var(--border-width) solid var(--bordercolor); border-radius:6px; background:var(--background); color:var(--foreground); font:inherit; }
    .an-dates input:hover { border-color:var(--foreground); }
    .an-note { margin:8px 0 0; color:var(--desccolor); font-size:12px; line-height:1.7; overflow-wrap:anywhere; }
    .an-summary { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
    .an-value { display:block; font-size:30px; font-weight:800; font-variant-numeric:tabular-nums; margin:0; overflow-wrap:anywhere; }
    .an-charts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; margin-top:20px; }
    .an-chart { margin:0; --plot-h:180px; --axis-h:20px; min-width:0; padding:0 8px; }
    .an-chart figcaption { font-size:14px; font-weight:700; margin-bottom:10px; }
    .an-chart [data-single="true"] .dot { opacity:1; }
    .an-chart [data-single="true"] .singleValue { position:absolute; left:var(--marker-x, 50%); top:var(--y); transform:translate(-50%,calc(-100% - 12px)); font-size:12px; font-weight:700; white-space:nowrap; color:var(--foreground); }
    .an-chart .an-empty { min-height:calc(var(--plot-h) + 2.4rem); }
    .an-empty { display:grid; place-content:center; min-height:180px; color:var(--desccolor); font-size:14px; text-align:center; }
    .an-tableScroll { overflow-x:auto; margin-top:16px; min-width:0; max-width:100%; }
    .an-table { width:100%; border-collapse:collapse; font-size:13px; font-variant-numeric:tabular-nums; }
    .an-table th, .an-table td { padding:12px 8px; border-bottom:var(--border-width) solid var(--bordercolor); text-align:right; }
    .an-table th { color:var(--desccolor); font-size:12px; white-space:nowrap; }
    .an-table th:first-child, .an-table td:first-child { text-align:left; }
    .an-table td:first-child { min-width:140px; overflow-wrap:anywhere; }
    .an-table a { color:var(--foreground); text-decoration:none; }
    .an-table a:hover { color:var(--linkhovercolor); text-decoration:underline; }
    .an-status { display:block; margin-top:4px; font-size:11px; color:var(--desccolor); }
    .an-secondary { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }
    .an-tags { display:grid; gap:14px; margin:20px 0 0; padding:0; list-style:none; }
    .an-tagRow { display:flex; justify-content:space-between; gap:12px; font-size:13px; overflow-wrap:anywhere; }
    .an-bar { height:6px; border-radius:4px; background:var(--codefontbgcolor); margin-top:6px; overflow:hidden; }
    .an-bar span { display:block; height:100%; background:var(--chartbar); border-radius:inherit; }
    .an-weekday td:first-child { min-width:0; }
    .an-srOnly { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
    &.an-dashboard button:disabled, .an-dashboard button:disabled { cursor:not-allowed; color:var(--desccolor); }
    /* 같은 날짜의 위치와 간격도 선의 전환 속도에 맞춘다. */
    .an-chart .series > div { transition: left 360ms ease-out, width 360ms ease-out, transform 360ms ease-out; }
    .an-chart .dot { transition: top 360ms ease-out; }
    .an-axisTransition span { transition: left 360ms ease-out; }
    @media (prefers-reduced-motion: reduce) {
        .an-chart .series > div, .an-chart .dot, .an-axisTransition span { transition: none; }
    }
    .an-refreshStatus { color:var(--desccolor); font-size:12px; display:grid; gap:4px; }
    .an-refreshStatus:not(:empty) { margin-top:10px; }
    /* 빠른 조회도 날짜 칸처럼 라벨이 위, 버튼이 아래다. 라벨 줄·버튼 줄이 날짜 입력과 같은 높이에 맞춰 한 줄로 읽힌다 */
    .an-shortcuts { flex-shrink:0; display:grid; grid-template-columns:repeat(3,auto); align-items:end; gap:5px 6px; min-width:0; }
    .an-shortcuts > span { grid-column:1 / -1; color:var(--desccolor); font-size:12px; }
    .an-shortcuts button { justify-content:center; white-space:nowrap; }
    &.an-analyticsRoot, .an-analyticsRoot { gap:clamp(16px,2vw,24px); container-type:inline-size; container-name:analytics; }
    .an-toolbar > .an-note { margin:0; }
    /*
     * 기간 카드는 위(제목) · 가운데(필터) · 아래(비교 설명) 세 조각이다. 세 조각이 붙어 한 장의 카드처럼 보이고,
     * 가운데 필터 줄만 sticky 로 헤더(64px) 밑에 붙는다. 그 줄이 결과 끝까지 붙어 있으려면 부모가 결과까지 감싸야 하므로
     * 조각들은 바깥 flex(그리드가 아니다 — 그리드 아이템은 제 칸 안에서만 붙는다)에 직접 올라가고, 결과와의 간격은 결과 쪽 여백으로 준다.
     * 붙어 있는 동안(data-stuck)에는 카드 테두리를 감추고 헤더와 같은 바탕을 화면 좌우 끝까지 칠해(넘침은 html 의 overflow-x: clip 이 자른다)
     * 헤더와 필터 사이로 뒤 화면이 비치지 않게 하고, 아래에 경계선 하나만 남긴다
     */
    &.an-dashboard.an-analyticsRoot, .an-dashboard.an-analyticsRoot { display:flex; flex-direction:column; gap:0; }
    .an-periodResults { margin-top:clamp(16px,2vw,24px); }
    .an-periodCard { display:contents; }
    .an-periodTop, .an-periodControls, .an-periodBottom { min-width:0; background:var(--cardbackground); border:var(--border-width) solid var(--bordercolor); }
    .an-periodTop { border-bottom:0; border-radius:12px 12px 0 0; padding:20px 20px 0; }
    /* 줄바꿈하지 않는다 — 좁아지면 날짜 칸이 줄어든다(빠른 조회가 다음 줄로 떨어지면 두 묶음의 라벨 줄이 어긋난다) */
    .an-periodControls { position:sticky; top:64px; z-index:10; display:flex; align-items:flex-end; justify-content:space-between; gap:20px; border-top:0; border-bottom:0; padding:12px 20px; }
    .an-periodBottom { border-top:0; border-radius:0 0 12px 12px; padding:0 20px 20px; }
    .an-periodBottom > .an-comparison:first-child { margin-top:0; }
    .an-periodBottom > .an-note:first-child { margin-top:0; }
    .an-periodControls[data-stuck] { background:transparent; border-color:transparent; }
    .an-periodControls[data-stuck]::before { content:""; position:absolute; z-index:-1; inset:0 -100vmax; background:var(--background); border-bottom:var(--border-width) solid var(--bordercolor); }
    .an-summaryCard { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.6fr); align-items:center; gap:16px; }
    .an-summaryMain, .an-summaryAside { min-width:0; }
    .an-summaryMain h3 { margin-bottom:6px; }
    .an-summaryAside { display:grid; gap:5px; text-align:right; font-size:12px; line-height:1.6; color:var(--desccolor); overflow-wrap:anywhere; }
    .an-summaryAside strong { color:var(--foreground); }
    .an-comparison { display:flex; flex-wrap:wrap; gap:4px 20px; margin-top:12px; color:var(--desccolor); font-size:12px; line-height:1.7; min-width:0; overflow-wrap:anywhere; }
    .an-comparison > span:last-child { flex-basis:100%; }
    .an-toolbar > [role="group"] { min-width:0; max-width:100%; flex-wrap:wrap; }
    ${mobile} {
        .an-summary, .an-charts, .an-secondary { grid-template-columns:minmax(0,1fr); }
        .an-dates { grid-template-columns:repeat(2,minmax(0,1fr)); }
        &.an-panel, .an-panel { padding:14px; }
        &.an-dashboard, .an-dashboard { gap:16px; }
        .an-summary { gap:10px; }
        .an-summaryCard { gap:10px; grid-template-columns:minmax(0,1fr) minmax(0,1.7fr); }
        .an-value { font-size:24px; }
        .an-dates input, .an-shortcuts button { min-height:40px; }
        /*
         * 필터 줄은 날짜 두 칸 아래에 빠른 조회 세 버튼이 한 줄로 반씩·삼등분으로 꽉 찬다(예전 기간 적용 버튼 자리).
         * 버튼 글자(7일 등)가 스스로 뜻을 말하므로 "빠른 조회" 라벨은 숨기고(그룹 이름은 aria-label), 그 줄이 그대로 붙는다
         */
        .an-periodTop { padding:14px 14px 0; }
        .an-periodBottom { padding:0 14px 14px; }
        .an-periodControls { display:grid; grid-template-columns:minmax(0,1fr); justify-content:stretch; gap:8px; padding:12px 14px; }
        .an-shortcuts { grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
        .an-shortcuts > span { display:none; }
        .an-table th, .an-table td { padding:10px 6px; }
        /*
         * 카드 제목 · 집계 기준 · 선택(pills)이 한 줄에 들어가게 좁힌다. 두 줄로 떨어지면 카드마다 머리 높이가 갈린다.
         * 집계 기준은 ⓘ 만 남기고(이름은 aria-label 이 읽는다), 간격과 pills 좌우 여백을 줄인다
         */
        .an-helpLabel { display:none; }
        .an-helpRoot > .an-toolbar { gap:8px; }
        .an-helpRoot .an-helpHeading { column-gap:4px; }
        .an-helpRoot > .an-toolbar > [role="group"] button { padding-inline:.4rem; }
    }
    /* 375px 보다 좁으면 정렬 버튼 끝의 "순" 까지 숨겨야 320px 에서도 한 줄에 든다 */
    @media (max-width: 374px) {
        .an-sortSuffix { display:none; }
        .an-helpRoot > .an-toolbar { gap:6px; }
        .an-helpRoot > .an-toolbar > [role="group"] button { padding-inline:.3rem; }
    }
    .an-helpRoot { position:relative; min-width:0; }
    .an-helpHeading { display:flex; align-items:center; flex-wrap:wrap; gap:6px 10px; min-width:0; }
    .an-helpButton { display:inline-flex; align-items:center; gap:4px; padding:3px 5px; border:var(--border-width) solid transparent; border-radius:4px; background:transparent; color:var(--desccolor); font:inherit; font-size:12px; font-weight:400; line-height:1.5; white-space:nowrap; cursor:pointer; }
    .an-helpButton:hover, .an-helpButton:focus-visible { color:var(--foreground); }
    .an-helpBody { position:absolute; z-index:20; top:calc(100% + 8px); left:0; width:min(360px,100%); box-sizing:border-box; padding:12px 14px; border:var(--border-width) solid var(--bordercolor); border-radius:8px; background:var(--cardbackground); box-shadow:0 4px 16px var(--shadowcolor); font-size:12px; font-weight:400; line-height:1.7; color:var(--foreground); overflow-wrap:anywhere; }
    .an-helpBody p { margin:0; }
    .an-helpBody dl { display:grid; gap:10px; margin:0; }
    .an-helpBody dt { display:inline; margin-right:8px; font-weight:700; }
    .an-helpBody dd { display:inline; margin:0; }
    .an-helpDetail { display:block; color:var(--desccolor); font-variant-numeric:tabular-nums; }
    .an-helpBody .an-helpFootnote { margin-top:12px; padding-top:10px; border-top:var(--border-width) solid var(--bordercolor); color:var(--desccolor); }
    .an-performanceTable { table-layout:fixed; }
    .an-performanceTable th, .an-performanceTable td { vertical-align:middle; }
    .an-performanceTable th:first-child { width:52%; }
    .an-performanceTable th:nth-child(2) { width:32%; }
    .an-performanceTable th:last-child { width:16%; white-space:normal; }
    .an-performanceTable .an-status { line-height:1.6; }
    .an-mobileLabel { display:none; }
    .an-postTitle a { overflow-wrap:anywhere; }
    /* 제목 아래 태그 — 짧은 제목이어도 제목 칸이 비어 보이지 않는다 */
    .an-postTags { margin-top:6px; }
    .an-share { margin-left:6px; font-size:12px; color:var(--desccolor); font-variant-numeric:tabular-nums; }
    .an-mobileComparison { display:none; }
    ${mobile} {
        .an-performanceTable, .an-performanceTable tbody { display:block; }
        .an-performanceTable thead { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
        /* 카드 안을 2행 2열로 나눈다: 제목 | 조회수, 태그 | 조회 일수. 제목 칸은 display:contents 로 풀어 제목과 태그가 각자 행을 차지하고,
           오른쪽 두 값은 라벨 열 폭을 맞춰 같은 세로선에서 시작한다. 증감은 값 아래 줄로 내려 오른쪽 칸이 제목 칸을 밀어내지 않게 한다 */
        .an-performanceTable tr { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:0 16px; padding:10px 0; border-bottom:var(--border-width) solid var(--bordercolor); }
        .an-performanceTable td { display:block; min-width:0; padding:0; border:0; text-align:left; }
        .an-performanceTable td:first-child { display:contents; }
        .an-performanceTable .an-postTitle a { grid-column:1; grid-row:1; min-width:0; align-self:center; }
        .an-performanceTable .an-postTags { grid-column:1; grid-row:2; margin:0; align-self:center; min-width:0; }
        .an-performanceTable td:nth-child(2) { grid-row:1; align-self:center; }
        .an-performanceTable td:last-child { grid-row:2; align-self:center; }
        .an-performanceTable td:nth-child(2), .an-performanceTable td:last-child { grid-column:2; display:grid; grid-template-columns:4.5rem auto auto; justify-content:start; align-items:baseline; column-gap:6px; white-space:nowrap; }
        .an-performanceTable td:nth-child(2) .an-status { grid-column:2 / -1; margin-top:2px; }
        .an-performanceTable .an-postTitle a { font-weight:700; line-height:1.6; }
        .an-performanceTable .an-status { display:inline; margin:0; }
        .an-performanceTable .an-share { margin-left:0; }
        .an-mobileLabel { display:inline; color:var(--desccolor); font-size:11px; }
        .an-comparisonLabel { display:none; }
        .an-mobileComparison { display:block; }
    }
`;
