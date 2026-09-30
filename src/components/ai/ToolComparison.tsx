"use client";

import { useState } from "react";
import { niceCeil } from "@/lib/admin-chart";
import { sumTotals, type PublicWeek } from "@/lib/ai-usage";
import SentenceText from "./SentenceText";
import { AiSegments, number } from "./AiControls";
import styles from "./AiDashboard.module.css";

const tools = ["Codex", "Claude"] as const;
const metrics = [
    { key: "total", label: "전체 토큰", description: "입력과 출력의 합입니다. 재사용한 캐시 입력도 포함합니다." },
    { key: "non_cache_read_input", label: "캐시 제외 입력", description: "입력에서 캐시 읽기를 제외한 토큰입니다. 전체 입력과 구분해 살펴봅니다." },
    { key: "output", label: "출력", description: "응답으로 생성된 토큰입니다. 제공된 추론 토큰도 출력에 포함됩니다." },
] as const;

function shortNumber(value: number) {
    if (value >= 100_000_000) return `${number(Number((value / 100_000_000).toFixed(1)))}억`;
    if (value >= 10_000) return `${number(Number((value / 10_000).toFixed(1)))}만`;
    return number(value);
}

export default function ToolComparison({ weeks, allWeeks = weeks }: { weeks: PublicWeek[]; allWeeks?: PublicWeek[] }) {
    const [metric, setMetric] = useState<(typeof metrics)[number]["key"]>("total");
    const selected = metrics.find(m => m.key === metric)!;
    const visible = new Set(weeks.map(w => w.week));
    const allRows = allWeeks.map(week => ({
        ...week,
        values: tools.map(tool => sumTotals(week.tools.filter(t => t.tool === tool).map(t => t.totals))[metric]),
    }));
    const rows = allRows.filter(w => visible.has(w.week));
    const ceiling = niceCeil(Math.max(1, ...rows.filter(w => w.observed).flatMap(w => w.values)));
    const observed = rows.some(w => w.observed);
    return <section className={`${styles.card} ${styles.comparison}`} aria-labelledby="tool-comparison-title">
        <div className={styles.sectionHeading}>
            <div><h3 id="tool-comparison-title">Codex와 Claude, 주별로 비교하기</h3><p className={styles.note}>같은 주의 사용량을 같은 눈금으로 나란히 봅니다.</p></div>
            <AiSegments aria-label="비교할 토큰 종류">{metrics.map(m => <button key={m.key} aria-pressed={metric === m.key} onClick={() => setMetric(m.key)}>{m.label}</button>)}</AiSegments>
        </div>
        <p className={styles.note}><SentenceText>{selected.description}</SentenceText></p>
        <div className={styles.toolTotals} aria-label={`선택 기간 ${selected.label} 합계`}>
            {tools.map((tool, index) => <div key={tool} data-tool={tool}><span className={styles.toolName}><i aria-hidden="true" />{tool}</span><strong>{observed ? number(rows.filter(w => w.observed).reduce((sum, w) => sum + w.values[index], 0)) : "—"}<small> 토큰</small></strong></div>)}
        </div>
        <div className={styles.comparisonScroll} tabIndex={0} aria-label="주별 도구 사용량 비교 스크롤">
            <div className={styles.chartScale} aria-hidden="true"><span>0</span><span>{shortNumber(ceiling / 2)}</span><span>{shortNumber(ceiling)} 토큰</span></div>
            <ol className={styles.comparisonWeeks} aria-label={`주별 ${selected.label}`}>
                {allRows.map(w => <li key={w.week} className={styles.comparisonRow} data-visible={visible.has(w.week)} aria-hidden={!visible.has(w.week)} inert={!visible.has(w.week)}><div className={styles.comparisonClip}><div className={styles.comparisonWeek}>
                    <div className={styles.weekHeading}><time dateTime={w.week}>{w.week.slice(5).replace("-", ".")} 주</time><span className={styles.note}>{!w.observed ? "기록 없음" : !w.ended ? "집계 중" : w.partial ? "부분 관측" : ""}</span></div>
                    {w.observed ? <div className={styles.weekBars}>{tools.map((tool, index) => <div key={tool} className={styles.barRow} data-tool={tool} aria-label={`${w.week} ${tool}: ${number(w.values[index])} ${selected.label}`}>
                        <span className={styles.barLabel}>{tool}</span>
                        <span className={styles.barTrack} aria-hidden="true"><span className={styles.barFill} style={{ width: `${Math.min(100, w.values[index] / ceiling * 100)}%` }} /></span>
                        <span className={styles.barValue}>{number(w.values[index])}</span>
                    </div>)}</div> : <p className={styles.missingWeek}>수집된 기록이 없어 비교하지 않습니다.</p>}
                </div></div></li>)}
            </ol>
            {!weeks.length && <p className={styles.emptyState}>선택 기간의 기록이 없습니다.</p>}
        </div>
        <p className={styles.note}><SentenceText>월요일 시작 · KST. 숫자는 관측한 토큰 수이며, 도구의 성능이나 작업 효율 순위를 뜻하지 않습니다.</SentenceText></p>
    </section>;
}
