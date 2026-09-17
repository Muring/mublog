"use client";

import { useState, type CSSProperties } from "react";
import type { DailyPoint, TagDailyViews } from "@/lib/stats";
import { bucketPoints, BUCKETS, lineSegments, niceCeil, type BucketKey } from "@/lib/admin-chart";
import { ChartCard, Plot, Axis, RangeTabs } from "./VisitorChart.styled";
import { Legend, Column } from "./TagViewsChart.styled";
import Dropdown from "@/components/ui/Dropdown";
import styles from "./Management.module.css";

export default function AdminAnalytics({ points, tags, today, totalVisitors }: {
    points: DailyPoint[]; tags: TagDailyViews[]; today: string; totalVisitors: number;
}) {
    const [metric, setMetric] = useState<"visits" | "tags">("visits");
    const [bucket, setBucket] = useState<BucketKey>("daily");
    const [year, setYear] = useState(today.slice(0, 4));
    const [hidden, setHidden] = useState<string[]>([]);
    const years = [...new Set([today.slice(0, 4), ...points.map((p) => p.date.slice(0, 4)), ...tags.flatMap((t) => t.points.map((p) => p.date.slice(0, 4)))])].sort().reverse();
    const source = metric === "visits" ? [{ tag: "방문", color: "var(--chartbar)", points }]
        : tags.map((tag, index) => ({ ...tag, color: `var(--series-${index % 8 + 1})` }));
    const series = source.map((s) => ({ ...s, bars: bucketPoints(s.points.map((p) => ({ date: p.date, value: p.visitors })), bucket, year, today) }));
    const visible = series.filter((s) => metric === "visits" || !hidden.includes(s.tag));
    const columns = bucketPoints([], bucket, year, today);
    const unit = metric === "visits" ? "명" : "회";
    const todayVisits = points.find((p) => p.date === today)?.visitors ?? 0;
    const todayValue = visible.reduce((sum, s) => sum + (s.points.find((p) => p.date === today)?.visitors ?? 0), 0);
    const periodTotal = visible.reduce((sum, s) => sum + s.bars.reduce((n, b) => n + (b.value ?? 0), 0), 0);
    const known = columns.filter((_, i) => visible.some((s) => s.bars[i].value !== null));
    const ceiling = niceCeil(Math.max(1, ...visible.flatMap((s) => s.bars.map((b) => b.value ?? 0))));
    const xAt = (i: number) => i / (columns.length - 1) * 100;
    const step = Math.ceil((columns.length - 1) / 4);
    const shown = new Set<number>();
    for (let i = columns.length - 1; i >= 0; i -= step) shown.add(i);
    if (Math.min(...shown) >= step * 0.6) shown.add(0);
    const periodStart = columns[0].key + (bucket === "monthly" ? "-01" : "");
    const calendarEnd = bucket === "monthly" ? `${year}-12-31` : columns.at(-1)!.period.split(" ~ ").at(-1)!;
    const periodLabel = `${periodStart} ~ ${calendarEnd > today ? today : calendarEnd}`;
    return (
        <ChartCard>
            <summary><span className="title">방문·조회 통계</span><span className="summary-value">오늘 방문 <strong>{todayVisits.toLocaleString("ko-KR")}</strong>명</span></summary>
            <div className="body">
                <div className={styles.chartTabs} role="tablist" aria-label="통계 종류">
                    {([['visits', '방문'], ['tags', '태그별 조회']] as const).map(([key, title]) => (
                        <button type="button" role="tab" id={`analytics-tab-${key}`} aria-controls="analytics-panel" aria-selected={metric === key} tabIndex={metric === key ? 0 : -1} key={key}
                            onClick={() => setMetric(key)} onKeyDown={(event) => {
                                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                                event.preventDefault();
                                const next = event.key === "Home" ? "visits" : event.key === "End" ? "tags" : metric === "visits" ? "tags" : "visits";
                                setMetric(next); document.getElementById(`analytics-tab-${next}`)?.focus();
                            }}>{title}</button>
                    ))}
                </div>
                <div className="controls">
                    <RangeTabs role="group" aria-label="집계 기간">
                        {BUCKETS.map((b) => <button type="button" key={b.key} aria-pressed={bucket === b.key} className={bucket === b.key ? "active" : undefined} onClick={() => setBucket(b.key)}>{b.label}</button>)}
                    </RangeTabs>
                    {bucket === "monthly" && <Dropdown label="연도 선택" size="control" align="right" value={year} options={years.map((value) => ({ value, label: `${value}년` }))} onChange={setYear} />}
                </div>
                <div id="analytics-panel" role="tabpanel" aria-labelledby={`analytics-tab-${metric}`}>
                    <div className={styles.analyticsSummary}>
                        <div>오늘 ({today}) <strong>{todayValue.toLocaleString("ko-KR")}{unit}</strong> · 선택 기간 <strong>{periodTotal.toLocaleString("ko-KR")}{unit}</strong>
                        {metric === "visits" && <> · 누적 <strong>{totalVisitors.toLocaleString("ko-KR")}명</strong></>}</div>
                        <div>집계 기간 <strong>{periodLabel}</strong> · 한국 시간(KST)</div>
                        <small>{metric === "tags" ? "선택 태그 합산 · 여러 태그가 붙은 글의 조회는 중복 포함" : "방문 수는 일별 순 방문자의 합계"} · 오늘은 현재까지 집계 · 집계 시작 전과 미래는 기록 없음</small>
                    </div>
                    {known.length < 2 ? <div className="empty" role="status"><strong>{known.length ? "추이를 표시하려면 두 구간 이상의 기록이 필요합니다." : "선택 기간에 집계된 기록이 없습니다."}</strong><span>{known.length ? `${known[0].period}의 집계 값은 위 요약에서 확인할 수 있습니다.` : "다른 기간을 선택하거나 기록이 쌓인 뒤 확인해 주세요."}</span></div> : <>
                        <Plot>
                            {[ceiling, ceiling / 2, 0].map((tick) => <div key={tick} className="gridline" data-base={tick === 0} style={{ bottom: `${tick / ceiling * 100}%` }} aria-hidden><span>{tick}</span></div>)}
                            <div className="series">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                                    {visible.flatMap((s) => lineSegments(s.bars.map((b) => b.value), ceiling).map((d, index) => <path key={`${s.tag}-${index}`} className="line" d={d} style={{ stroke: s.color }} vectorEffect="non-scaling-stroke" />))}
                                </svg>
                                {columns.map((column, i) => <Column key={column.key} tabIndex={0} role="img"
                                    aria-label={`${column.period}: ${visible.map((s) => `${s.tag} ${s.bars[i].value === null ? '기록 없음' : `${s.bars[i].value}${unit}`}`).join(', ')}`}
                                    data-edge={i < 3 ? "first" : i >= columns.length - 3 ? "last" : undefined}
                                    style={{ "--x": `${xAt(i)}%`, "--w": `${100 / columns.length}%` } as CSSProperties}>
                                    <span className="rule" />
                                    {visible.map((s) => s.bars[i].value !== null && <span className="dot" key={s.tag} style={{ "--y": `${100 - s.bars[i].value! / ceiling * 100}%`, "--series": s.color } as CSSProperties} />)}
                                    <span className="tip"><span className="date">{column.period}</span>{visible.map((s) => <span className="row" key={s.tag} style={{ "--series": s.color } as CSSProperties}><span className="swatch" />{s.tag}<span className="value">{s.bars[i].value === null ? "기록 없음" : `${s.bars[i].value}${unit}`}</span></span>)}</span>
                                </Column>)}
                            </div>
                        </Plot>
                        <Axis>{columns.map((c, i) => <span key={c.key} style={{ "--x": `${xAt(i)}%` } as CSSProperties} data-show={shown.has(i)} data-edge={i === 0 ? "first" : i === columns.length - 1 ? "last" : undefined}>{c.label}</span>)}</Axis>
                    </>}
                    {metric === "tags" && series.length > 0 && <Legend aria-label="표시할 태그 · 수치는 선택 기간 합계">{series.map((s) => <button type="button" key={s.tag} aria-pressed={!hidden.includes(s.tag)} style={{ "--series": s.color } as CSSProperties}
                        onClick={() => setHidden((previous) => previous.includes(s.tag) ? previous.filter((tag) => tag !== s.tag) : previous.length < series.length - 1 ? [...previous, s.tag] : previous)}>
                        <span className="swatch" />#{s.tag}<span className="total">{s.bars.reduce((sum, b) => sum + (b.value ?? 0), 0)}회</span>
                    </button>)}</Legend>}
                </div>
            </div>
        </ChartCard>
    );
}
