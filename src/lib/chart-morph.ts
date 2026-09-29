type Point = [number, number];

function vertices(path: string): Point[] {
    return path.split(/\s+/).filter(Boolean).map(command => command.slice(1).split(",").map(Number) as Point);
}

function sample(points: Point[], fraction: number): Point {
    const position = fraction * (points.length - 1);
    const index = Math.floor(position);
    const a = points[index];
    const b = points[Math.min(index + 1, points.length - 1)];
    const weight = position - index;
    return [a[0] + (b[0] - a[0]) * weight, a[1] + (b[1] - a[1]) * weight];
}

/** 한 연속 선분의 꼭짓점 수를 맞춘다. 양쪽의 모든 꺾임을 보존한다. */
export function chartMorph(from: string, to: string) {
    const before = vertices(from);
    const after = vertices(to);
    if (!before.length || !after.length) return () => to;
    const knots = [...new Set([0, 1, ...before.map((_, i) => i / Math.max(1, before.length - 1)), ...after.map((_, i) => i / Math.max(1, after.length - 1))])].sort((a, b) => a - b);
    const pairs = knots.map(t => [sample(before, t), sample(after, t)]);
    return (progress: number) => {
        if (progress <= 0) return from;
        if (progress >= 1) return to;
        return pairs.map(([a, b], i) => `${i ? "L" : "M"}${a[0] + (b[0] - a[0]) * progress},${a[1] + (b[1] - a[1]) * progress}`).join(" ");
    };
}
