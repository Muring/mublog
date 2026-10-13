/*
 * 관리 목록(포스트·댓글·이미지)과 통계가 같이 쓰는 날짜 조건.
 * 주소에는 YYYY-MM-DD 로 싣고, 범위는 **KST** 하루 단위다 — 서버(Vercel)는 UTC 라 그냥 자르면 아침 9시 전 기록이 전날로 간다.
 */

/** YYYY-MM-DD 로 실재하는 날짜만 받는다. 2026-02-30 처럼 Date 가 조용히 넘겨버리는 값도 걸러낸다 */
export function dateParam(value?: string | null) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}

/** 날짜 범위(from ~ to). 거꾸로 넣었으면 뒤집어 준다 — 오류로 막기보다 뜻이 분명하다 */
export function dateRangeParams(from?: string | null, to?: string | null) {
    const a = dateParam(from), b = dateParam(to);
    return a && b && a > b ? { from: b, to: a } : { from: a, to: b };
}

/** 날짜 범위를 시각 조건으로(DB where 에 그대로 쓴다). 종료일은 그날 전체를 포함하도록 다음 날 자정 "미만" 으로 잡는다 */
export function kstDayRange(from: string, to: string) {
    return {
        ...(from ? { gte: new Date(`${from}T00:00:00+09:00`) } : {}),
        ...(to ? { lt: new Date(new Date(`${to}T00:00:00+09:00`).getTime() + 86_400_000) } : {}),
    };
}

/** 이미 받아 둔 목록을 같은 범위로 거른다(kstDayRange 와 같은 경계) */
export function withinAdminDates(iso: string, from = "", to = "") {
    const time = Date.parse(iso);
    const { gte, lt } = kstDayRange(from, to);
    return (!gte || time >= gte.getTime()) && (!lt || time < lt.getTime());
}

export function adminDateLabel(from: string, to: string) {
    const dot = (date: string) => date.replaceAll("-", ".");
    if (from && to) return `${dot(from)} ~ ${dot(to)}`;
    return from ? `${dot(from)} 이후` : `${dot(to)} 이전`;
}
