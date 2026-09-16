/**
 * 표 셀에 들어가는 아주 작은 추이선. 축도 눈금도 없다 — 옆 행과 모양을 견주는 게 목적이다.
 * 색은 방문자 차트와 같은 --chartbar 를 쓴다. 전부 0 이면 부르는 쪽이 "–" 로 대신한다.
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
                stroke="var(--chartbar)"
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
}
