"use client";

import { useMemo, useState } from "react";
import { ChartCard, Plot, Bar, Axis, RangeTabs } from "./VisitorChart.styled";
import type { DailyPoint } from "@/lib/stats";

/**
 * 기간과 묶는 단위.
 *
 * 막대를 30개 남짓으로 유지하는 것이 목적이다. 1년치를 하루 한 칸으로 그리면
 * 850px 안에서 한 칸이 2.3px 가 되어 읽을 수도, 조준할 수도 없다.
 * 기간이 길어지면 단위를 키워 개수를 붙잡아 둔다.
 */
const RANGES = [
    { key: "30d", label: "30일", bucket: "day" },
    { key: "90d", label: "90일", bucket: "week" },
    { key: "1y", label: "올해", bucket: "month" },
] as const;

/** 최근 n일. 30일·90일은 오늘에서 거꾸로 센다 */
const lastDays = (points: DailyPoint[], n: number) => points.slice(-n);

/**
 * 올해 1월 1일부터.
 *
 * 달력 해로 끊어야 "1월, 2월 …" 이 해마다 같은 자리에 온다. 최근 365일로 하면
 * 볼 때마다 시작 달이 밀려 두 시점을 비교할 수 없다.
 *
 * 집계를 시작하기 전 달은 만들지 않는다. 1월부터 재기 시작한 해에는 자연히
 * 1월부터 나오고, 8월에 시작한 해에는 8월부터 나온다. 없는 0 을 그리지 않는다.
 */
function thisYear(points: DailyPoint[]): DailyPoint[] {
    if (points.length === 0) return points;
    const year = points[points.length - 1].date.slice(0, 4);
    return points.filter((p) => p.date.startsWith(year));
}

type RangeKey = (typeof RANGES)[number]["key"];
type Bucket = (typeof RANGES)[number]["bucket"];
type Point = { key: string; label: string; tip: string; visitors: number };

/** 그 주의 월요일 (ISO 주 시작) */
function weekStart(iso: string): string {
    const d = new Date(`${iso}T00:00:00Z`);
    const day = (d.getUTCDay() + 6) % 7; // 월=0
    d.setUTCDate(d.getUTCDate() - day);
    return d.toISOString().slice(0, 10);
}

const md = (iso: string) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;

function bucketize(points: DailyPoint[], bucket: Bucket): Point[] {
    if (bucket === "day") {
        return points.map((p) => ({
            key: p.date,
            label: md(p.date),
            tip: `${p.visitors}명 · ${p.date}`,
            visitors: p.visitors,
        }));
    }

    const sums = new Map<string, number>();
    for (const p of points) {
        const k = bucket === "week" ? weekStart(p.date) : p.date.slice(0, 7);
        sums.set(k, (sums.get(k) ?? 0) + p.visitors);
    }

    return [...sums.entries()].map(([k, visitors]) => {
        if (bucket === "week") {
            const end = new Date(`${k}T00:00:00Z`);
            end.setUTCDate(end.getUTCDate() + 6);
            return {
                key: k,
                label: md(k),
                tip: `${visitors}명 · ${md(k)}~${md(end.toISOString().slice(0, 10))}`,
                visitors,
            };
        }
        return {
            key: k,
            label: `${Number(k.slice(5, 7))}월`,
            tip: `${visitors}명 · ${k}`,
            visitors,
        };
    });
}

/**
 * 날짜별 방문자 추이.
 *
 * 늘 확인하는 값이 아니라 접어 둔다. 접힌 상태에서도 요약 한 줄은 보이므로
 * 굳이 펼치지 않아도 오늘과 최근 합계는 알 수 있다.
 * details/summary 를 쓰는 이유는 열고 닫기와 키보드 조작을 브라우저가 이미
 * 해주기 때문이다. 여기에 상태를 따로 들 이유가 없다.
 *
 * 계열이 하나라 범례를 두지 않는다 — 제목이 무엇을 그린 것인지 이미 말한다.
 * 값은 막대마다 적지 않는다. 최댓값 하나만 눈금으로 세우고 나머지는
 * 호버·포커스 툴팁이 맡는다.
 */
export default function VisitorChart({ points }: { points: DailyPoint[] }) {
    const [range, setRange] = useState<RangeKey>("30d");
    const active = RANGES.find((r) => r.key === range) ?? RANGES[0];

    const bars = useMemo(() => {
        const sliced =
            active.key === "1y" ? thisYear(points) : lastDays(points, active.key === "30d" ? 30 : 90);
        return bucketize(sliced, active.bucket);
    }, [points, active]);

    const today = points.length > 0 ? points[points.length - 1].visitors : 0;
    const total = bars.reduce((sum, b) => sum + b.visitors, 0);
    const max = Math.max(1, ...bars.map((b) => b.visitors));

    // 눈금 글자가 서로 겹치지 않을 만큼만 남긴다
    const step = Math.max(1, Math.ceil(bars.length / 8));

    return (
        <ChartCard>
            <summary>
                <span className="title">방문자 추이</span>
                <span className="summary-value">
                    오늘 <strong>{today.toLocaleString("ko-KR")}</strong>명 · {active.label}{" "}
                    <strong>{total.toLocaleString("ko-KR")}</strong>명
                </span>
            </summary>

            <div className="body">
                <RangeTabs role="group" aria-label="기간 선택">
                    {RANGES.map((r) => (
                        <button
                            key={r.key}
                            type="button"
                            className={r.key === range ? "active" : undefined}
                            aria-pressed={r.key === range}
                            onClick={() => setRange(r.key)}
                        >
                            {r.label}
                        </button>
                    ))}
                </RangeTabs>

                {bars.length === 0 ? (
                    <p className="empty">아직 집계된 날이 없습니다.</p>
                ) : (
                    <>
                        <Plot style={{ "--bars": bars.length } as React.CSSProperties}>
                            {/* 최댓값 눈금 하나. 그 아래 값들은 툴팁이 받는다 */}
                            <div className="gridline" style={{ bottom: "100%" }} aria-hidden>
                                <span>{max}</span>
                            </div>

                            {bars.map((b) => (
                                <Bar
                                    key={b.key}
                                    tabIndex={0}
                                    role="img"
                                    data-zero={b.visitors === 0}
                                    data-tip={b.tip}
                                    aria-label={b.tip}
                                    style={
                                        {
                                            "--h": `${Math.round((b.visitors / max) * 100)}%`,
                                        } as React.CSSProperties
                                    }
                                />
                            ))}
                        </Plot>

                        <Axis style={{ "--bars": bars.length } as React.CSSProperties}>
                            {bars.map((b, i) => (
                                <span
                                    key={b.key}
                                    data-show={
                                        i === 0 || i === bars.length - 1 || i % step === 0
                                    }
                                >
                                    {b.label}
                                </span>
                            ))}
                        </Axis>
                    </>
                )}
            </div>
        </ChartCard>
    );
}
