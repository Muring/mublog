"use client";
import type { ReactNode } from "react";
import { AiBadge, type Tone } from "./AiControls";
import manage from "./AiManagement.module.css";

/** 상세의 한 줄: 넓은 화면은 이름·값 두 열, 좁은 화면은 이름이 값 위에 작게 붙는다 */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
    return <div className={manage.fact}><dt>{label}</dt><dd>{children}</dd></div>;
}

/** 짧은 줄 목록. null 은 미수집, 빈 배열은 기록 없음으로 구분해 보조색 한 줄로만 남긴다 */
export function Lines({ items, empty = "기록 없음" }: { items: ReactNode[] | null | undefined; empty?: string }) {
    if (!items?.length) return <span className={manage.factEmpty}>{items === null ? "미수집" : empty}</span>;
    if (items.length === 1) return <span>{items[0]}</span>;
    return <ul className={manage.factList}>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

export const CHECK_RESULTS: Record<"pass" | "fail" | "not_run" | "unknown", [string, Tone]> = { pass: ["통과", "ok"], fail: ["실패", "danger"], not_run: ["미실행", "warn"], unknown: ["미상", "neutral"] };

/**
 * 배지가 붙는 목록(검증·남은 일·지식·효과)은 모두 배지를 앞에 두고 글을 오른쪽에 둔다.
 * 배지는 글 첫 줄 가운데에 맞고, 글이 여러 줄이 돼도 배지 오른쪽 열 안에서만 줄이 바뀐다.
 */
export function TagList({ items, empty = "기록 없음" }: { items: { badge: ReactNode; body: ReactNode }[] | null | undefined; empty?: string }) {
    if (!items?.length) return <span className={manage.factEmpty}>{items === null ? "미수집" : empty}</span>;
    return <ul className={manage.checkList}>{items.map((x, i) => <li key={i}>{x.badge}<span>{x.body}</span></li>)}</ul>;
}

/** 검사 한 건 = 배지 + 이름 한 줄. 방법·한계는 이름과 다를 때만 그 아래 작게 붙인다 */
export function Checks({ checks }: { checks: { name: string; result: keyof typeof CHECK_RESULTS; detail?: (string | null | undefined)[] }[] }) {
    return <TagList empty="기록된 검사 없음" items={checks.map(c => ({
        badge: <AiBadge data-tone={CHECK_RESULTS[c.result][1]}>{CHECK_RESULTS[c.result][0]}</AiBadge>,
        body: <>{c.name}{(c.detail ?? []).filter((d): d is string => Boolean(d) && d !== c.name).map((n, j) => <small key={j}>{n}</small>)}</>,
    }))} />;
}
