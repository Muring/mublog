/**
 * 표 셀에 들어가는 아주 작은 추이선. 축도 눈금도 없다 — 옆 행과 모양을 견주는 게 목적이다.
 *
 * 높이 기준(max)은 부르는 쪽이 준다. 행마다 제 최댓값으로 재면 2회짜리와 20회짜리가
 * 같은 높이가 돼서 견줄 수가 없다. 표 전체의 최댓값 하나를 모든 행이 같이 쓴다.
 * 색은 방문자 차트와 같은 --chartbar 를 쓴다. 전부 0 이면 바닥에 테두리색으로 흐리게 긋는다 —
 * 자리를 비우지 않아야 행마다 열의 모양이 같다.
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
    const pad = 1.5;
    const y = (v: number) => (height - pad - (v / top) * (height - pad * 2)).toFixed(1);
    // 점이 하나면 이을 상대가 없어 아무것도 안 그려진다. 짧은 가로 선으로 "여기 값이 있다" 만 남긴다.
    const points =
        values.length === 1
            ? `0,${y(values[0])} ${width},${y(values[0])}`
            : values.map((v, i) => `${((i * width) / (values.length - 1)).toFixed(1)},${y(v)}`).join(" ");
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
            <polyline
                points={points}
                fill="none"
                stroke={empty ? "var(--bordercolor)" : "var(--chartbar)"}
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
}
