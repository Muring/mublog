"use client";

import { useMemo, useState } from "react";
import { ChartCard, Plot, Axis, RangeTabs } from "./VisitorChart.styled";
import { Legend, Column } from "./TagViewsChart.styled";
import { BUCKETS, type BucketKey, type Point, niceCeil, linePath, daily, weekly, monthly } from "./VisitorChart";
import Dropdown from "@/components/ui/Dropdown";
import type { TagDailyViews } from "@/lib/stats";

/**
 * 태그별 조회 추이. 태그마다 선 하나씩 겹쳐 그려 견준다.
 *
 * VisitorChart 의 카드·눈금·축·묶음 함수를 그대로 쓰고, 계열이 여럿이라 달라지는 것만 여기 있다 —
 * 고정 순서의 색(--series-N), 범례(누르면 껐다 켬), 한 칸의 값을 전부 보여주는 툴팁.
 * 색은 태그에 붙는다. 범례에서 계열을 꺼도 남은 선의 색은 그대로다.
 */
export default function TagViewsChart({ tags }: { tags: TagDailyViews[] }) {
    const [bucket, setBucket] = useState<BucketKey>("daily");
    const [animate, setAnimate] = useState(false);
    const [hidden, setHidden] = useState<Set<string>>(new Set());

    const years = useMemo(() => {
        const set = new Set(tags.flatMap((t) => t.points.map((p) => p.date.slice(0, 4))));
        return [...set].sort().reverse();
    }, [tags]);
    const [year, setYear] = useState(() => years[0] ?? String(new Date().getFullYear()));
    const activeYear = years.includes(year) ? year : (years[0] ?? year);

    // 태그마다 묶은 점. 같은 구간을 같은 함수로 묶으니 칸 수와 순서가 전부 같다.
    const series = useMemo(
        () =>
            tags.map((t, i) => ({
                tag: t.tag,
                total: t.total,
                color: `var(--series-${(i % 8) + 1})`,
                bars:
                    bucket === "daily"
                        ? daily(t.points, "회")
                        : bucket === "weekly"
                          ? weekly(t.points, "회")
                          : monthly(t.points, activeYear, "회"),
            })),
        [tags, bucket, activeYear],
    );
    const visible = series.filter((s) => !hidden.has(s.tag));
    const columns: Point[] = series[0]?.bars ?? [];
    const known = columns.filter((c) => c.visitors !== null);

    const max = Math.max(1, ...visible.flatMap((s) => s.bars.map((b) => b.visitors ?? 0)));
    const ceiling = niceCeil(max);
    const ticks = [ceiling, ceiling / 2, 0];
    const xAt = (i: number) => (columns.length === 1 ? 50 : (i / (columns.length - 1)) * 100);
    const yAt = (v: number) => 100 - (v / ceiling) * 100;

    const step = Math.max(1, Math.ceil(columns.length / 8));
    const shown = new Set<number>();
    for (let i = columns.length - 1; i >= 0; i -= step) shown.add(i);
    if (!shown.has(0) && Math.min(...shown) >= step * 0.6) shown.add(0);

    function toggle(tag: string) {
        setHidden((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag);
            else if (next.size < series.length - 1) next.add(tag); // 마지막 하나는 끄지 않는다
            return next;
        });
    }

    const todayTotal = visible.reduce((sum, s) => sum + (s.bars.at(-1)?.visitors ?? 0), 0);
    const total = tags.reduce((sum, t) => sum + t.total, 0);

    return (
        <ChartCard onToggle={(e) => !e.currentTarget.open && setAnimate(false)}>
            <summary>
                <span className="title">태그별 조회</span>
                <span className="summary-value">
                    오늘 <strong>{todayTotal.toLocaleString("ko-KR")}</strong>회 · 기록 후{" "}
                    <strong>{total.toLocaleString("ko-KR")}</strong>회
                </span>
            </summary>

            <div className="body">
                <div className="controls">
                    <RangeTabs role="group" aria-label="집계 단위">
                        {BUCKETS.map((b) => (
                            <button
                                key={b.key}
                                type="button"
                                className={b.key === bucket ? "active" : undefined}
                                aria-pressed={b.key === bucket}
                                onClick={() => {
                                    setAnimate(true);
                                    setBucket(b.key);
                                }}
                            >
                                {b.label}
                            </button>
                        ))}
                    </RangeTabs>
                    {years.length > 0 && (
                        <Dropdown
                            size="sm"
                            label="연도 선택"
                            hidden={bucket !== "monthly"}
                            value={activeYear}
                            options={years.map((y) => ({ value: y, label: `${y}년` }))}
                            onChange={(y) => {
                                setAnimate(true);
                                setYear(y);
                            }}
                        />
                    )}
                </div>

                {tags.length === 0 || known.length === 0 ? (
                    <p className="empty">아직 집계된 날이 없습니다.</p>
                ) : known.length === 1 ? (
                    <p className="empty">
                        <strong>{known[0].label} 하루치</strong>
                        <br />
                        추이를 그리려면 {BUCKETS.find((b) => b.key === bucket)?.unit} 둘 이상 쌓여야 합니다.
                        지금 값은 아래 범례에 있습니다.
                    </p>
                ) : (
                    <>
                        <Plot data-animate={animate}>
                            {ticks.map((t) => (
                                <div
                                    key={t}
                                    className="gridline"
                                    data-base={t === 0}
                                    style={{ bottom: `${(t / ceiling) * 100}%` }}
                                    aria-hidden
                                >
                                    <span>{t}</span>
                                </div>
                            ))}
                            <div className="series">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                                    {visible.map((s) => {
                                        // 기록이 없는 구간(null)에서는 선을 끊는다 (VisitorChart 와 같은 이유)
                                        const segs: { x: number; y: number }[][] = [];
                                        let cur: { x: number; y: number }[] = [];
                                        s.bars.forEach((b, i) => {
                                            if (b.visitors === null) {
                                                if (cur.length) segs.push(cur);
                                                cur = [];
                                            } else cur.push({ x: xAt(i), y: yAt(b.visitors) });
                                        });
                                        if (cur.length) segs.push(cur);
                                        return segs.map((seg) => (
                                            <path
                                                key={`${s.tag}-${seg[0].x}`}
                                                className="line"
                                                d={linePath(seg)}
                                                style={{ stroke: s.color }}
                                                vectorEffect="non-scaling-stroke"
                                            />
                                        ));
                                    })}
                                </svg>

                                {columns.map((c, i) => (
                                    <Column
                                        key={c.key}
                                        tabIndex={0}
                                        role="img"
                                        aria-label={`${c.label}: ${visible
                                            .map((s) => `${s.tag} ${s.bars[i].visitors ?? 0}회`)
                                            .join(", ")}`}
                                        data-edge={i === 0 ? "first" : i === columns.length - 1 ? "last" : undefined}
                                        style={
                                            {
                                                "--x": `${xAt(i)}%`,
                                                "--w": `${Math.max(100 / columns.length, 6)}%`,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <span className="rule" />
                                        {visible.map(
                                            (s) =>
                                                s.bars[i].visitors !== null && (
                                                    <span
                                                        key={s.tag}
                                                        className="dot"
                                                        style={
                                                            {
                                                                "--y": `${yAt(s.bars[i].visitors)}%`,
                                                                "--series": s.color,
                                                            } as React.CSSProperties
                                                        }
                                                    />
                                                ),
                                        )}
                                        <span className="tip">
                                            <span className="date">{c.tip.split(" · ")[1] ?? c.label}</span>
                                            {visible.map((s) => (
                                                <span
                                                    key={s.tag}
                                                    className="row"
                                                    style={{ "--series": s.color } as React.CSSProperties}
                                                >
                                                    <span className="swatch" />
                                                    {s.tag}
                                                    <span className="value">{s.bars[i].visitors ?? "-"}</span>
                                                </span>
                                            ))}
                                        </span>
                                    </Column>
                                ))}
                            </div>
                        </Plot>
                        <Axis>
                            {columns.map((c, i) => (
                                <span
                                    key={c.key}
                                    style={{ "--x": `${xAt(i)}%` } as React.CSSProperties}
                                    data-show={shown.has(i)}
                                    data-edge={i === 0 ? "first" : i === columns.length - 1 ? "last" : undefined}
                                >
                                    {c.label}
                                </span>
                            ))}
                        </Axis>
                    </>
                )}

                <Legend aria-label="태그">
                    {series.map((s) => (
                        <button
                            key={s.tag}
                            type="button"
                            aria-pressed={!hidden.has(s.tag)}
                            onClick={() => toggle(s.tag)}
                            style={{ "--series": s.color } as React.CSSProperties}
                            title={hidden.has(s.tag) ? "다시 보이기" : "숨기기"}
                        >
                            <span className="swatch" />
                            #{s.tag}
                            <span className="total">{s.total}</span>
                        </button>
                    ))}
                </Legend>
            </div>
        </ChartCard>
    );
}
