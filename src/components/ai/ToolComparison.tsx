"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { lineSegments, niceCeil } from "@/lib/admin-chart";
import { sumTotals, weekRange, type PublicWeek } from "@/lib/ai-usage";
import { Plot, Axis } from "@/components/admin/VisitorChart.styled";
import { Column } from "@/components/admin/TagViewsChart.styled";
import AnimatedChartPath from "@/components/admin/AnimatedChartPath";
import Info from "./Info";
import ParagraphText from "./ParagraphText";
import RollingNumber from "./RollingNumber";
import { AiSegments, number } from "./AiControls";
import styles from "./AiDashboard.module.css";

const tools = ["Codex", "Claude"] as const;
const metrics = [
    { key: "total", label: "전체 토큰", description: "입력과 출력의 합입니다. 재사용한 캐시 입력도 포함합니다." },
    { key: "non_cache_read_input", label: "캐시 제외 입력", description: "입력에서 캐시 읽기를 제외한 토큰입니다. 전체 입력과 구분해 살펴봅니다." },
    { key: "output", label: "출력", description: "응답으로 생성된 토큰입니다. 제공된 추론 토큰도 출력에 포함됩니다." },
] as const;
const units = [["week", "주"], ["month", "월"]] as const;
type Unit = (typeof units)[number][0];
const shapes = [["line", "꺾은선"], ["bar", "막대"]] as const;
type Shape = (typeof shapes)[number][0];

type Point = { key: string; label: string; axis: string; values: (number | null)[]; ongoing: boolean; partial: boolean; clipped: boolean };

function shortNumber(value: number) {
    if (value >= 100_000_000) return `${number(Number((value / 100_000_000).toFixed(1)))}억`;
    if (value >= 10_000) return `${number(Number((value / 10_000).toFixed(1)))}만`;
    return number(value);
}

/** 기록 없는 구간은 건너뛰고 앞뒤 관측점을 바로 잇는다. 그 구간에 점은 찍지 않고 툴팁에서 "기록 없음"으로 알린다. */
function connectedPath(values: (number | null)[], ceiling: number) {
    const vertices = values.flatMap((value, i) => value === null ? [] : [`${values.length === 1 ? 50 : i / (values.length - 1) * 100},${100 - value / ceiling * 100}`]);
    return vertices.length > 1 ? vertices.map((v, i) => `${i ? "L" : "M"}${v}`).join(" ") : null;
}

/*
 * 주는 그대로 한 점이다. 월은 시작 월요일이 속한 달에 그 주를 통째로 넣는다(주 합계를 날짜별로 쪼갤 자료가 없다).
 * 선택 기간이 달의 앞부분을 잘라 먹었으면 clipped, 그 달에 기록 없는 주가 섞였으면 partial 로 표시한다.
 */
function buildPoints(weeks: PublicWeek[], allWeeks: PublicWeek[], unit: Unit, metric: (typeof metrics)[number]["key"]): Point[] {
    const value = (w: PublicWeek, tool: string) => sumTotals(w.tools.filter(t => t.tool === tool).map(t => t.totals))[metric];
    if (unit === "week") return weeks.map(w => ({
        key: w.week, label: weekRange(w.week), axis: w.week.slice(5).replace("-", "/"),
        values: tools.map(tool => w.observed ? value(w, tool) : null),
        ongoing: w.observed && !w.ended, partial: w.observed && w.partial, clipped: false,
    }));
    const months = new Map<string, PublicWeek[]>();
    for (const w of weeks) months.set(w.week.slice(0, 7), [...(months.get(w.week.slice(0, 7)) ?? []), w]);
    return [...months].map(([month, group]) => {
        const observed = group.filter(w => w.observed);
        return {
            key: month, label: `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`, axis: `${Number(month.slice(5))}월`,
            values: tools.map(tool => observed.length ? observed.reduce((sum, w) => sum + value(w, tool), 0) : null),
            ongoing: observed.some(w => !w.ended),
            partial: observed.length > 0 && (observed.length < group.length || observed.some(w => w.partial)),
            clipped: group.length < allWeeks.filter(w => w.week.startsWith(month)).length,
        };
    });
}

export default function ToolComparison({ weeks, allWeeks = weeks }: { weeks: PublicWeek[]; allWeeks?: PublicWeek[] }) {
    const [metric, setMetric] = useState<(typeof metrics)[number]["key"]>("total");
    const [unit, setUnit] = useState<Unit>("week");
    const [shape, setShape] = useState<Shape>("line");
    const [focused, setFocused] = useState(0);
    const selected = metrics.find(m => m.key === metric)!;
    const points = buildPoints(weeks, allWeeks, unit, metric);
    const known = points.filter(p => p.values.some(v => v !== null));
    const totals = tools.map((_, index) => known.reduce((sum, p) => sum + (p.values[index] ?? 0), 0));
    const ceiling = niceCeil(Math.max(1, ...known.flatMap(p => p.values.filter((v): v is number => v !== null))));
    const single = known.length === 1;
    // 점이 적으면 늘 찍는다. 기록이 한 구간뿐인 도구는 선분이 없어 점이 아니면 안 보인다
    const marked = points.length <= 12;
    const knownCount = tools.map((_, index) => points.filter(p => p.values[index] !== null).length);
    const paths = tools.map((_, index) => connectedPath(points.map(p => p.values[index]), ceiling));
    const solid = tools.map((_, index) => lineSegments(points.map(p => p.values[index]), ceiling).filter(d => d.includes("L")));
    // 첫 관측과 마지막 관측 사이에 기록 없는 구간이 끼어 있으면 점선이 생긴다
    const bridged = tools.some((_, index) => { const seen = points.map(p => p.values[index] !== null); return seen.some((v, i) => !v && seen.slice(0, i).includes(true) && seen.slice(i + 1).includes(true)); });
    // 꺾은선은 양 끝 점이 축 끝에 닿고, 막대는 구간마다 같은 폭의 칸 가운데에 선다
    const bar = shape === "bar";
    const n = points.length;
    const xAt = (i: number) => bar ? (i + 0.5) / n * 100 : n === 1 ? 50 : i / (n - 1) * 100;
    const slot = (i: number) => bar || n === 1
        ? { "--w": `${100 / n}%`, "--hit-offset": "-50%", "--marker-x": "50%" }
        : { "--w": `${100 / (n - 1) / (i === 0 || i === n - 1 ? 2 : 1)}%`, "--hit-offset": i === 0 ? "0%" : i === n - 1 ? "-100%" : "-50%", "--marker-x": i === 0 ? "0%" : i === n - 1 ? "100%" : "50%" };
    const navigate = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? points.length - 1 : Math.max(0, Math.min(points.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
        setFocused(next);
        (event.currentTarget.parentElement?.querySelector(`[data-point="${next}"]`) as HTMLElement)?.focus();
    };
    const flags = (p: Point) => [p.ongoing && "집계 중", p.partial && "부분 관측", p.clipped && "선택 기간 밖의 주 제외"].filter((f): f is string => !!f);
    return <section className={`${styles.card} ${styles.comparison}`} aria-labelledby="tool-comparison-title">
        <div className={styles.sectionHeading}>
            <div className={styles.titleRow}><h3 id="tool-comparison-title">Codex와 Claude, {unit === "week" ? "주별로" : "월별로"} 비교하기</h3><Info><span className={styles.paragraph}>같은 기간의 사용량을 같은 눈금으로 나란히 봅니다. 월요일 시작 · KST.</span><span className={styles.paragraph}>월 단위는 주를 시작 월요일이 속한 달에 묶습니다.</span><span className={styles.paragraph}>숫자는 관측한 토큰 수이며, 도구의 성능이나 작업 효율 순위를 뜻하지 않습니다.</span></Info></div>
            <div className={styles.comparisonControls}>
                <AiSegments aria-label="비교할 토큰 종류">{metrics.map(m => <button key={m.key} aria-pressed={metric === m.key} onClick={() => setMetric(m.key)}>{m.label}</button>)}</AiSegments>
                <AiSegments aria-label="묶는 단위">{units.map(([value, label]) => <button key={value} aria-pressed={unit === value} onClick={() => setUnit(value)}>{label}</button>)}</AiSegments>
                <AiSegments aria-label="그래프 모양">{shapes.map(([value, label]) => <button key={value} aria-pressed={shape === value} onClick={() => setShape(value)}>{label}</button>)}</AiSegments>
            </div>
        </div>
        <p className={styles.note}><ParagraphText>{selected.description}</ParagraphText></p>
        <div className={styles.toolTotals} aria-label={`선택 기간 ${selected.label} 합계`}>
            {tools.map((tool, index) => <div key={tool} data-tool={tool}><span className={styles.toolName}><i aria-hidden="true" />{tool}</span><strong><RollingNumber value={known.length ? number(totals[index]) : "—"} /><small> 토큰</small></strong></div>)}
        </div>
        <figure className={styles.lineChart} data-shape={shape} aria-label={`${unit === "week" ? "주별" : "월별"} ${selected.label} 추이`}>
            {!known.length ? <p className={styles.emptyState}>선택 기간의 기록이 없습니다.</p> : <>
                <Plot>
                    {[ceiling, ceiling / 2, 0].map(tick => <div key={tick} className="gridline" data-base={tick === 0} style={{ bottom: `calc(var(--plot-h) * ${tick / ceiling})` }} aria-hidden><span>{shortNumber(tick)}</span></div>)}
                    <div className="series">
                        {!bar && <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                            {tools.map((tool, index) => <g key={tool} data-tool={tool}>
                                {/* 관측점 전체를 잇는 선을 점선으로 깔고, 기록이 이어진 구간은 실선으로 덮는다. 기록 없는 주를 건너는 부분만 점선으로 남는다 */}
                                {paths[index] && <g data-bridge><AnimatedChartPath d={paths[index]} /></g>}
                                {solid[index].map((d, i) => <AnimatedChartPath key={i} d={d} />)}
                            </g>)}
                        </svg>}
                        {points.map((p, i) => {
                            const rows = tools.map((tool, index) => `${tool} ${p.values[index] === null ? "기록 없음" : number(p.values[index]!)}`);
                            return <Column key={p.key} data-point={i} tabIndex={i === Math.min(focused, points.length - 1) ? 0 : -1} role="img" aria-label={`${p.label}: ${rows.join(", ")}${flags(p).map(f => ` · ${f}`).join("")}`} onKeyDown={e => navigate(e, i)}
                                data-edge={i < points.length / 3 ? "first" : i >= points.length * 2 / 3 ? "last" : undefined}
                                style={{ "--x": `${xAt(i)}%`, ...slot(i) } as CSSProperties}>
                                {bar
                                    ? <span className={styles.barGroup} aria-hidden>{tools.map((tool, index) => <span key={tool} data-tool={tool} data-empty={p.values[index] === null || undefined} style={{ height: `${(p.values[index] ?? 0) / ceiling * 100}%` }} />)}</span>
                                    : <><span className="rule" />{tools.map((tool, index) => p.values[index] !== null && <span key={tool} className="dot" data-tool={tool} data-show={marked || knownCount[index] === 1} style={{ "--y": `${100 - p.values[index]! / ceiling * 100}%` } as CSSProperties} />)}</>}
                                <span className="tip"><span className="date">{p.label}</span>{tools.map((tool, index) => <span key={tool} className="row" data-tool={tool}><span className="swatch" />{tool}<span className="value">{p.values[index] === null ? "기록 없음" : number(p.values[index]!)}</span></span>)}{flags(p).map(f => <span key={f} className="row">{f}</span>)}</span>
                            </Column>;
                        })}
                    </div>
                </Plot>
                <Axis className={styles.lineAxis} data-dense={n > 6 || undefined}>{points.map((p, i) => <span key={p.key} data-show={n <= 12 || i === 0 || i === n - 1 || i % Math.ceil((n - 1) / 6) === 0} data-minor={i % 2 === 1 && i !== n - 1 || undefined} data-edge={points.length === 1 ? undefined : i === 0 ? "first" : i === points.length - 1 ? "last" : undefined} style={{ "--x": `${xAt(i)}%` } as CSSProperties}>{p.axis}</span>)}</Axis>
            </>}
            {!bar && bridged && <p className={styles.gapLegend}><i aria-hidden="true" />기록이 없는 주를 건너 이은 구간</p>}
            {known.length > 0 && <p className={styles.note}>{bar ? "막대에 올리거나 방향키로 구간을 옮기면 값을 봅니다. 기록이 없는 구간은 비워 둡니다." : single ? "한 구간의 기록만 있어 추세선은 표시하지 않습니다." : "점에 올리거나 방향키로 구간을 옮기면 값을 봅니다."}</p>}
        </figure>
    </section>;
}
