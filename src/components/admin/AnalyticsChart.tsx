"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { rangeBuckets, type AnalyticsRange, type MetricPoint } from "@/lib/admin-analytics";
import { lineSegments, niceCeil } from "@/lib/admin-chart";
import { Plot, Axis } from "./VisitorChart.styled";
import { Column } from "./TagViewsChart.styled";
import AnimatedChartPath from "./AnimatedChartPath";
import styles from "./Analytics.module.css";

export default function AnalyticsChart({ title, unit, points, since, range, today }: {
    title: string; unit: string; points: MetricPoint[]; since: string | null; range: AnalyticsRange; today: string;
}) {
    const bars = rangeBuckets(points, since, range, today);
    const [focused, setFocused] = useState(0);
    const known = bars.filter(b => b.value !== null);
    const ceiling = niceCeil(Math.max(1, ...known.map(b => b.value!)));
    const xAt = (i: number) => bars.length === 1 ? 50 : i / (bars.length - 1) * 100;
    const navigate = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? bars.length - 1 : Math.max(0, Math.min(bars.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
        setFocused(next);
        (event.currentTarget.parentElement?.querySelector(`[data-point="${next}"]`) as HTMLElement)?.focus();
    };
    return <figure className={styles.chart} aria-label={`${title} 추이`}>
        <figcaption>{title} <span className={styles.note}>({unit})</span></figcaption>
        {known.length === 0 ? <div className={styles.empty}>선택 기간에 집계된 기록이 없습니다.</div> : <>
            <Plot>
                {[ceiling, ceiling / 2, 0].map(tick => <div key={tick} className="gridline" data-base={tick === 0} style={{ bottom: `calc(var(--plot-h) * ${tick / ceiling})` }} aria-hidden><span>{tick.toLocaleString("ko-KR")}</span></div>)}
                <div className="series">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                        {lineSegments(bars.map(b => b.value), ceiling).map((d, i) => <AnimatedChartPath key={i} d={d} />)}
                    </svg>
                    {bars.map((bar, i) => {
                        const period = bar.from === bar.to ? bar.from : `${bar.from} ~ ${bar.to}`;
                        const value = bar.value === null ? "기록 없음" : `${bar.value.toLocaleString("ko-KR")}${unit}`;
                        const label = `${period}: ${value}${bar.partial && bar.value !== null ? " · 부분 집계" : ""}${bar.ongoing ? " · 집계 중" : ""}`;
                        return <Column key={i} data-point={i} data-single={known.length === 1 && bar.value !== null} tabIndex={i === Math.min(focused, bars.length - 1) ? 0 : -1} role="img" aria-label={label} onKeyDown={e => navigate(e, i)}
                            data-edge={i < bars.length / 3 ? "first" : i >= bars.length * 2 / 3 ? "last" : undefined}
                            style={{ "--x": `${xAt(i)}%`, "--w": `${bars.length === 1 ? 100 : 100 / (bars.length - 1) / (i === 0 || i === bars.length - 1 ? 2 : 1)}%`, "--hit-offset": bars.length === 1 ? "-50%" : i === 0 ? "0%" : i === bars.length - 1 ? "-100%" : "-50%", "--marker-x": bars.length === 1 ? "50%" : i === 0 ? "0%" : i === bars.length - 1 ? "100%" : "50%", "--y": `${100 - (bar.value ?? 0) / ceiling * 100}%`, "--series": "var(--chartbar)" } as CSSProperties}>
                            <span className="rule" />
                            {bar.value !== null && <span className="dot" />}
                            {known.length === 1 && bar.value !== null && <span className="singleValue">{value}</span>}
                            <span className="tip"><span className="date">{period}</span>{value}{bar.partial && bar.value !== null && <span className="row">부분 집계</span>}{bar.ongoing && <span className="row">집계 중</span>}</span>
                        </Column>;
                    })}
                </div>
            </Plot>
            <Axis className={styles.axisTransition}>{bars.map((bar, i) => <span key={i} data-show={i === 0 || i === bars.length - 1 || i % Math.max(1, Math.ceil((bars.length - 1) / 3)) === 0} data-edge={bars.length === 1 ? undefined : i === 0 ? "first" : i === bars.length - 1 ? "last" : undefined} style={{ "--x": `${xAt(i)}%` } as CSSProperties}>{range.bucket === "monthly" ? bar.key : bar.from.slice(5).replace("-", "/")}</span>)}</Axis>
        </>}
        <p className={styles.note}>{known.length > 0 && "방향키로 구간 이동 · "}{known.length === 1 ? "한 구간의 기록만 있어 추세선은 표시하지 않습니다." : "기록 시작 전은 빈 구간으로 표시합니다."}</p>
    </figure>;
}
