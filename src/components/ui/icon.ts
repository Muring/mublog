/**
 * 선으로 그린 24px 격자 아이콘의 공통 속성.
 *
 * currentColor 라서 글자색(호버 색 포함)과 테마를 그대로 따른다 — 파일도 invert 필터도 필요 없다.
 * 크기와 선 굵기만 자리마다 다르다. em 을 주면 부모 font-size 를 따른다.
 *
 *   <svg {...strokeIcon(16)}><path d="…" /></svg>
 */
export function strokeIcon(size: number | string, strokeWidth = 2) {
    return {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    } as const;
}
