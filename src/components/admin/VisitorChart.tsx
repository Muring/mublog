"use client";

import { useMemo, useState } from "react";
import { ChartCard, Plot, Hit, Axis, RangeTabs, YearSelect } from "./VisitorChart.styled";
import type { DailyPoint } from "@/lib/stats";

/**
 * 묶는 단위.
 *
 * 점을 30개 남짓으로 유지하는 것이 목적이다. 1년치를 하루 한 점으로 그리면
 * 850px 안에서 한 칸이 2.3px 가 되어 읽을 수도, 조준할 수도 없다.
 *
 * Yearly 는 두지 않는다. 집계를 시작한 해가 하나뿐이라 막대가 1개고, 해가
 * 바뀌어도 2개·3개다. 한 개짜리 막대 차트는 차트가 아니라 그냥 숫자이고,
 * 그 숫자는 이미 접힌 줄의 "누적" 이 말하고 있다.
 */
const BUCKETS = [
    // unit 은 조사까지 붙여 둔다. "주" + "이" 는 "주이" 가 된다
    { key: "daily", label: "Daily", unit: "날이" },
    { key: "weekly", label: "Weekly", unit: "주가" },
    { key: "monthly", label: "Monthly", unit: "달이" },
] as const;

type BucketKey = (typeof BUCKETS)[number]["key"];

/** visitors 가 null 이면 "그 달은 기록 밖" 이라는 뜻이다. 0 과 구분한다. */
type Point = { key: string; label: string; tip: string; visitors: number | null };

/**
 * 눈금 천장을 깔끔한 수로 올린다.
 *
 * 실제 최댓값이 그대로 천장이면 눈금이 7, 13 처럼 읽기 나쁜 수가 된다.
 * 1·2·5 의 배수로 올려 0 / 절반 / 천장 세 눈금이 항상 정수로 떨어지게 한다.
 */
function niceCeil(value: number): number {
    if (value <= 4) return 4;
    const mag = 10 ** Math.floor(Math.log10(value));
    for (const step of [1, 2, 4, 5, 10]) {
        const candidate = step * mag;
        if (candidate >= value) return candidate;
    }
    return 10 * mag;
}

/**
 * 꼭짓점을 잇는 선.
 *
 * 점이 하나뿐인 덩어리는 선이 그려지지 않아 보이지 않는다. 그 자리에
 * 아주 짧은 가로 선을 그어 "여기 값이 있다" 는 것만 남긴다.
 */
function linePath(seg: { x: number; y: number }[]): string {
    if (seg.length === 1) {
        const { x, y } = seg[0];
        return `M${x - 0.6},${y} L${x + 0.6},${y}`;
    }
    return seg.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

/** 선 아래를 바닥까지 닫은 면 */
function areaPath(seg: { x: number; y: number }[]): string {
    const first = seg[0];
    const last = seg[seg.length - 1];
    return `${linePath(seg)} L${last.x},100 L${first.x},100 Z`;
}

const md = (iso: string) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;

/** 그 주의 월요일 (ISO 주 시작) */
function weekStart(iso: string): string {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
}

/** 최근 30일. 기록이 그보다 짧으면 있는 만큼만 */
function daily(points: DailyPoint[]): Point[] {
    return points.slice(-30).map((p) => ({
        key: p.date,
        label: md(p.date),
        tip: `${p.visitors}명 · ${p.date}`,
        visitors: p.visitors,
    }));
}

/** 최근 12주. 주는 월요일에 시작한다 */
function weekly(points: DailyPoint[]): Point[] {
    const sums = new Map<string, number>();
    for (const p of points) {
        const k = weekStart(p.date);
        sums.set(k, (sums.get(k) ?? 0) + p.visitors);
    }
    return [...sums.entries()].slice(-12).map(([k, visitors]) => {
        const end = new Date(`${k}T00:00:00Z`);
        end.setUTCDate(end.getUTCDate() + 6);
        return {
            key: k,
            label: md(k),
            tip: `${visitors}명 · ${md(k)}~${md(end.toISOString().slice(0, 10))}`,
            visitors,
        };
    });
}

/**
 * 고른 해의 열두 달을 전부 세운다.
 *
 * 기록이 없는 달은 0 이 아니라 빈 자리로 둔다. 8월에 집계를 시작한 해의 1~7월은
 * "아무도 안 왔다" 가 아니라 "세지 않았다" 이고, 아직 오지 않은 달도 마찬가지다.
 * 열두 칸을 유지해야 해가 달라져도 같은 자리에서 같은 달을 비교할 수 있다.
 */
function monthly(points: DailyPoint[], year: string): Point[] {
    const sums = new Map<string, number>();
    for (const p of points) {
        if (!p.date.startsWith(year)) continue;
        const k = p.date.slice(0, 7);
        sums.set(k, (sums.get(k) ?? 0) + p.visitors);
    }
    return Array.from({ length: 12 }, (_, i) => {
        const k = `${year}-${String(i + 1).padStart(2, "0")}`;
        const visitors = sums.get(k) ?? null;
        return {
            key: k,
            label: `${i + 1}월`,
            tip: visitors === null ? `기록 없음 · ${k}` : `${visitors}명 · ${k}`,
            visitors,
        };
    });
}

/**
 * 날짜별 방문자 추이.
 *
 * 늘 확인하는 값이 아니라 접어 둔다. 접힌 줄에 오늘과 누적이 남아 있어
 * 굳이 펼치지 않아도 알 것은 알 수 있다. details/summary 를 쓰는 이유는
 * 열고 닫기와 키보드 조작을 브라우저가 이미 해주기 때문이다.
 *
 * 계열이 하나라 범례를 두지 않는다 — 제목이 무엇을 그린 것인지 이미 말한다.
 * 값도 점마다 적지 않는다. 최댓값 하나만 적고 나머지는 호버·포커스 툴팁이 맡는다.
 */
export default function VisitorChart({
    points,
    totalVisitors,
}: {
    points: DailyPoint[];
    /** 집계를 시작한 뒤 지금까지의 누적 */
    totalVisitors: number;
}) {
    const [bucket, setBucket] = useState<BucketKey>("daily");

    /*
     * 그림을 드러내는 애니메이션을 켤지.
     *
     * 카드를 여는 동안에는 끈다. 그때는 카드 높이가 전환 중이라 그림이 동시에
     * 움직이면 두 전환이 겹쳐 흔들려 보인다. 사용자가 단위나 연도를
     * 바꿨을 때만 켜고, 카드를 닫으면 다시 끈다.
     */
    const [animate, setAnimate] = useState(false);

    // 기록이 있는 해만 고를 수 있다. 없는 해를 열어 빈 차트를 보여줄 이유가 없다.
    const years = useMemo(() => {
        const set = new Set(points.map((p) => p.date.slice(0, 4)));
        return [...set].sort().reverse();
    }, [points]);

    const [year, setYear] = useState(() => years[0] ?? String(new Date().getFullYear()));
    const activeYear = years.includes(year) ? year : (years[0] ?? year);

    const bars = useMemo(() => {
        if (bucket === "daily") return daily(points);
        if (bucket === "weekly") return weekly(points);
        return monthly(points, activeYear);
    }, [points, bucket, activeYear]);

    const today = points.length > 0 ? points[points.length - 1].visitors : 0;
    const max = Math.max(1, ...bars.map((b) => b.visitors ?? 0));
    // 눈금은 깔끔한 수까지 올리고, 막대 높이도 그 천장을 기준으로 잰다
    const ceiling = niceCeil(max);
    const ticks = [ceiling, ceiling / 2, 0];

    /*
     * 최댓값이 같은 점이 여럿이면 첫 번째에만 숫자를 적는다.
     * 둘 다 적으면 "100" 이 두 번 떠서 어느 쪽을 말하는지 흐려진다.
     */
    const peakIndex = max > 0 ? bars.findIndex((b) => b.visitors === max) : -1;

    /*
     * 점이 하나뿐이면 선을 긋지 않는다.
     *
     * 이을 상대가 없어 아주 짧은 가로 선이 되고, 그 아래를 바닥까지 채운 면이
     * 바늘처럼 솟은 막대가 된다 — 없는 추이를 그린 것처럼 보인다. 집계를 막
     * 시작해 하루치밖에 없을 때 Weekly·Monthly 가 늘 이 상태다.
     *
     * Yearly 를 두지 않은 것과 같은 이유다. 점 하나짜리 차트는 차트가 아니라
     * 그냥 숫자이고, 그러면 숫자로 적는 편이 정직하다.
     */
    const known = bars.filter((b) => b.visitors !== null);
    const only = known.length === 1 ? known[0] : null;

    /*
     * 눈금 글자가 서로 겹치지 않을 만큼만 남긴다.
     *
     * 오른쪽 끝에서부터 거꾸로 세어 자리를 잡는다. 앞에서부터 세면 마지막 눈금이
     * 바로 앞 눈금에 붙어버린다 (30개를 4칸씩 세면 28 과 29 가 나란히 선다).
     * 맨 왼쪽 눈금은 간격의 절반은 떨어져 있을 때만 남긴다.
     */
    const step = Math.max(1, Math.ceil(bars.length / 8));
    const shown = new Set<number>();
    for (let i = bars.length - 1; i >= 0; i -= step) shown.add(i);
    if (!shown.has(0) && Math.min(...shown) >= step * 0.6) shown.add(0);

    // 점은 0~100 안에 고르게 놓는다. 하나뿐이면 가운데
    const xAt = (i: number) => (bars.length === 1 ? 50 : (i / (bars.length - 1)) * 100);

    /*
     * 기록이 없는 구간에서 선을 끊는다.
     *
     * 앞뒤를 이어버리면 "그 사이에도 이만큼 왔다" 는 없는 사실이 그려진다.
     * 값이 있는 점만 모아 이어진 덩어리로 나누고, 덩어리마다 선을 따로 그린다.
     */
    const segments = useMemo(() => {
        const out: { x: number; y: number }[][] = [];
        let cur: { x: number; y: number }[] = [];
        bars.forEach((b, i) => {
            if (b.visitors === null) {
                if (cur.length > 0) out.push(cur);
                cur = [];
                return;
            }
            cur.push({ x: xAt(i), y: 100 - (b.visitors / ceiling) * 100 });
        });
        if (cur.length > 0) out.push(cur);
        return out;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bars, ceiling]);

    return (
        <ChartCard onToggle={(e) => !e.currentTarget.open && setAnimate(false)}>
            <summary>
                <span className="title">방문자 추이</span>
                {/* 집계 단위와 무관한 두 값이라 탭을 눌러도 바뀌지 않는다 */}
                <span className="summary-value">
                    오늘 <strong>{today.toLocaleString("ko-KR")}</strong>명 · 누적{" "}
                    <strong>{totalVisitors.toLocaleString("ko-KR")}</strong>명
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

                    {/* 연도는 Monthly 에서만 뜻이 있다. 자리는 늘 지킨다 */}
                    {years.length > 0 && (
                        <YearSelect
                            value={activeYear}
                            aria-label="연도 선택"
                            data-hidden={bucket !== "monthly"}
                            onChange={(e) => {
                                setAnimate(true);
                                setYear(e.target.value);
                            }}
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}년
                                </option>
                            ))}
                        </YearSelect>
                    )}
                </div>

                {known.length === 0 ? (
                    <p className="empty">아직 집계된 날이 없습니다.</p>
                ) : only ? (
                    <p className="empty">
                        <strong>{only.tip}</strong>
                        <br />
                        추이를 그리려면 {BUCKETS.find((b) => b.key === bucket)?.unit} 둘 이상
                        쌓여야 합니다.
                    </p>
                ) : (
                    <>
                        <Plot data-animate={animate}>
                            {/* y축 눈금. 값을 읽는 기준이라 늘 보인다 */}
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
                                    {segments.map((seg) => (
                                        <path key={`a${seg[0].x}`} className="area" d={areaPath(seg)} />
                                    ))}
                                    {segments.map((seg) => (
                                        <path
                                            key={`l${seg[0].x}`}
                                            className="line"
                                            d={linePath(seg)}
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    ))}
                                </svg>

                                {bars.map((b, i) => (
                                    <Hit
                                        key={b.key}
                                        tabIndex={0}
                                        role="img"
                                        data-peak={i === peakIndex}
                                        data-tip={b.tip}
                                        aria-label={b.tip}
                                        style={
                                            {
                                                "--x": `${xAt(i)}%`,
                                                "--y": `${b.visitors === null ? 100 : 100 - (b.visitors / ceiling) * 100}%`,
                                                "--w": `${Math.max(100 / bars.length, 6)}%`,
                                            } as React.CSSProperties
                                        }
                                    >
                                        {b.visitors !== null && <span className="dot" />}
                                        {i === peakIndex && <span className="peak-value">{max}</span>}
                                    </Hit>
                                ))}
                            </div>
                        </Plot>

                        <Axis>
                            {bars.map((b, i) => (
                                <span
                                    key={b.key}
                                    style={{ "--x": `${xAt(i)}%` } as React.CSSProperties}
                                    data-show={shown.has(i)}
                                    data-edge={
                                        i === 0 ? "first" : i === bars.length - 1 ? "last" : undefined
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
