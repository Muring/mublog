/**
 * 표 셀에 들어가는 아주 작은 추이선. 축도 눈금도 없다 — 옆 행과 모양을 견주는 게 목적이다.
 *
 * 높이 기준(max)은 부르는 쪽이 준다. 행마다 제 최댓값으로 재면 2회짜리와 20회짜리가
 * 같은 높이가 돼서 견줄 수가 없다. 표 전체의 최댓값 하나를 모든 행이 같이 쓴다.
 * 색은 방문자 차트와 같은 --chartbar 를 쓴다. 바닥선은 늘 그려서 행마다 열의 모양이 같다.
 * 칸이 하나뿐일 때 가로선을 그으면 값에 따라 위·아래로 튀어 정렬이 어긋난 것처럼 보인다 — 점으로 찍는다.
 */
export default function Sparkline({
    values,
    max,
    width = 64,
    height = 18,
}: {
    values: number[];
    /** 이 값이 꼭대기다. 표 전체에서 하나로 맞춘다 */
    max: number;
    width?: number;
    height?: number;
}) {
    const empty = values.every((v) => v === 0);
    const top = Math.max(1, max);
    const pad = 2;
    const y = (v: number) => Number((height - pad - (v / top) * (height - pad * 2)).toFixed(1));
    const baseline = y(0);
    const single = values.length === 1;
    const points = single
        ? ""
        : values.map((v, i) => `${((i * width) / (values.length - 1)).toFixed(1)},${y(v)}`).join(" ");
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
            {/* 바닥선은 늘 있다. 값이 없어도 자리와 높이 기준이 보인다 */}
            <line x1={0} y1={baseline} x2={width} y2={baseline} stroke="var(--bordercolor)" strokeWidth={1} />
            {!empty && !single && (
                <polyline
                    points={points}
                    fill="none"
                    stroke="var(--chartbar)"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            )}
            {/* 점이 하나면 선이 아니라 점이다. 오른쪽 끝(오늘)에 값 높이로 찍는다 */}
            {!empty && single && <circle cx={width - 2} cy={y(values[0])} r={2.5} fill="var(--chartbar)" />}
        </svg>
    );
}
