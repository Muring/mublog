"use client";

import { ChartCard, Plot, Bar, Axis } from "./VisitorChart.styled";
import type { DailyPoint } from "@/lib/stats";

/**
 * 날짜별 방문자 추이.
 *
 * 계열이 하나라 범례를 두지 않는다 — 제목이 무엇을 그린 것인지 이미 말한다.
 * 값은 막대마다 적지 않는다. 30개에 숫자를 다 적으면 아무도 읽지 않는다.
 * 최댓값 하나만 눈금으로 세우고 나머지는 호버·포커스 툴팁이 맡는다.
 *
 * 표(아래 목록)를 함께 두는 이유는 호버가 값을 가두면 안 되기 때문이다.
 * 마우스를 못 쓰는 사람도 모든 값에 닿을 수 있어야 한다.
 */
export default function VisitorChart({ points }: { points: DailyPoint[] }) {
    if (points.length === 0) {
        return (
            <ChartCard>
                <div className="chart-head">
                    <h3>날짜별 방문자</h3>
                </div>
                <p className="empty">아직 집계된 날이 없습니다.</p>
            </ChartCard>
        );
    }

    const max = Math.max(...points.map((p) => p.visitors));
    // 눈금은 깔끔한 수로 올린다. 0 만 있는 날들뿐이면 1 을 천장으로 둔다.
    const ceiling = Math.max(1, max);

    const first = points[0].date;
    const last = points[points.length - 1].date;
    const total = points.reduce((sum, p) => sum + p.visitors, 0);

    // 눈금 글자가 서로 겹치지 않을 만큼만 남긴다
    const step = Math.max(1, Math.ceil(points.length / 8));

    const label = (iso: string) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;

    return (
        <ChartCard>
            <div className="chart-head">
                <h3>날짜별 방문자</h3>
                <span className="range">
                    {label(first)} ~ {label(last)} · 합계 {total.toLocaleString("ko-KR")}명
                </span>
            </div>

            <Plot style={{ "--bars": points.length } as React.CSSProperties}>
                {/* 최댓값 눈금 하나. 그 아래 값들은 툴팁과 표가 받는다 */}
                <div className="gridline" style={{ bottom: "100%" }} aria-hidden>
                    <span>{ceiling}</span>
                </div>

                {points.map((p) => (
                    <Bar
                        key={p.date}
                        tabIndex={0}
                        role="img"
                        data-zero={p.visitors === 0}
                        data-tip={`${p.visitors}명 · ${p.date}`}
                        aria-label={`${p.date} ${p.visitors}명`}
                        style={
                            {
                                "--h": `${Math.round((p.visitors / ceiling) * 100)}%`,
                            } as React.CSSProperties
                        }
                    />
                ))}
            </Plot>

            <Axis style={{ "--bars": points.length } as React.CSSProperties}>
                {points.map((p, i) => (
                    <span
                        key={p.date}
                        data-show={i === 0 || i === points.length - 1 || i % step === 0}
                    >
                        {label(p.date)}
                    </span>
                ))}
            </Axis>
        </ChartCard>
    );
}
