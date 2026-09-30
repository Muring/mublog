"use client";
import { useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import Info from "./Info";
import RollingNumber from "./RollingNumber";
import ToolComparison from "./ToolComparison";
import { sumTotals, visibleWeeks, type PublicYear, type PublicWeek } from "@/lib/ai-usage";
import styles from "./AiDashboard.module.css";

import { AiSegments, number } from "./AiControls";
export { AiSegments, number } from "./AiControls";
export function UsageCards({ weeks, cacheObserved, rolling = false }: { weeks: PublicWeek[]; cacheObserved: boolean; rolling?: boolean }) {
    const totals = sumTotals(weeks.map(w => w.totals));
    const observed = weeks.some(w => w.observed);
    return <div className={styles.grid}>{[["전체 토큰", observed ? number(totals.total) : "—"], ["캐시 제외 입력", observed ? number(totals.non_cache_read_input) : "—"], ["출력", observed ? number(totals.output) : "—"], ["캐시 읽기 비율", cacheObserved && totals.input ? `${(100 * totals.cache_read / totals.input).toFixed(1)}%` : "미상"]].map(([label, value]) => <div className={styles.card} key={label}><span className={styles.note}>{label}</span><strong>{rolling ? <RollingNumber value={value} /> : value}</strong></div>)}</div>;
}
export function WeekTable({ weeks, compact = false }: { weeks: PublicWeek[]; compact?: boolean }) {
    return <div className={`${styles.tableScroll} ${compact ? "" : styles.publicTable}`} tabIndex={0} aria-label="주별 사용량 표 스크롤"><table><caption>월요일 시작 · KST · 캐시는 입력에 포함</caption><thead><tr>{["주 시작", "관측", "전체 토큰", "캐시 제외 입력", "캐시 읽기", "출력"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{weeks.map(w => <tr key={w.week}><td>{w.week}</td><td>{!w.observed ? "기록 없음" : !w.ended ? "집계 중" : w.partial ? "부분 관측" : "관측됨"}</td>{[w.totals.total, w.totals.non_cache_read_input, w.totals.cache_read, w.totals.output].map((v, i) => <td data-number key={i}>{w.observed ? number(v) : "—"}</td>)}</tr>)}</tbody></table>{!weeks.length && <p className={styles.note}>선택 기간의 기록이 없습니다.</p>}</div>;
}
export default function AiUsageView({ years, asOf }: { years: PublicYear[]; asOf: string }) {
    const [year, setYear] = useState(String(years[0]?.year ?? ""));
    const [period, setPeriod] = useState("8");
    const selected = years.find(y => String(y.year) === year);
    const weeks = visibleWeeks(selected?.weeks ?? [], period, new Date(asOf));
    const stale = selected?.observedUntil && Date.parse(asOf) - Date.parse(selected.observedUntil) > 48 * 3600_000;
    return <section aria-labelledby="ai-usage-title" className={styles.section}>
        <div className={styles.sectionHeading}><div className={styles.titleRow}><h2 id="ai-usage-title">실제 사용 현황</h2><Info>사용량을 기록하고, 필요한 맥락과 함께 살펴봅니다.</Info></div></div>
        <div className={styles.toolbar}><Dropdown label="조회 연도" value={year} options={years.map(y => ({ value: String(y.year), label: `${y.year}년` }))} onChange={setYear} /><AiSegments aria-label="조회 기간">{[["4", "4주"], ["8", "8주"], ["12", "12주"], ["year", "연도 전체"]].map(([value, label]) => <button key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{label}</button>)}</AiSegments></div>
        {!years.length ? <p className={styles.note}>아직 공개 집계가 연결되지 않았습니다. 데이터가 도착하면 여기에 표시합니다.</p> : <>
            {(stale || selected?.attention) && <p className={styles.warning}>일부 자료가 늦게 도착했거나 수집 상태를 확인 중입니다. 현재 표시된 관측 범위로 해석해 주세요.</p>}
            <UsageCards weeks={weeks} cacheObserved={selected?.cacheObserved ?? false} rolling />
            <ToolComparison weeks={weeks} allWeeks={selected?.weeks} />
            <WeekTable weeks={weeks} />
            <p className={`${styles.note} ${styles.titleRow}`}>자료 기준: {selected?.observedUntil ? new Date(Date.parse(selected.observedUntil) + 9 * 3600_000).toISOString().slice(0, 19).replace("T", " ") + " KST" : "미상"}<Info label="자료 기준 설명">요청 로그에서 관측한 수치이며 생산성·청구 금액·구독 잔여량을 뜻하지 않습니다. 기록이 없는 주는 사용량 0과 구분합니다.</Info></p>
        </>}
    </section>;
}
