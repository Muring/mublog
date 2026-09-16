/**
 * 표 셀에 들어가는 아주 작은 추이선. 축도 눈금도 없다 — 옆 행과 모양을 견주는 게 목적이다.
 * 색은 방문자 차트와 같은 --chartbar 를 쓴다. 전부 0 이면 바닥에 테두리색으로 흐리게 긋는다 —
 * 자리를 비우지 않아야 행마다 열의 모양이 같다.
 */
export default function Sparkline({
    values,
    width = 64,
    height = 18,
}: {
    values: number[];
    width?: number;
    height?: number;
}) {
    const empty = values.every((v) => v === 0);
    const max = Math.max(1, ...values);
    const step = values.length > 1 ? width / (values.length - 1) : 0;
    const pad = 1.5;
    const points = values
        .map((v, i) => `${(i * step).toFixed(1)},${(height - pad - (v / max) * (height - pad * 2)).toFixed(1)}`)
        .join(" ");
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
