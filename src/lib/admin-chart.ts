export type BucketKey = "daily" | "weekly" | "monthly";
export function niceCeil(value: number) {
    if (value <= 4) return 4;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    return [1, 2, 4, 5, 10].map((step) => step * magnitude).find((ceiling) => ceiling >= value)!;
}
export function lineSegments(values: (number | null)[], ceiling: number) {
    const segments: string[] = [];
    let current: string[] = [];
    values.forEach((value, index) => {
        if (value === null) {
            if (current.length) segments.push(current.join(" "));
            current = [];
        } else {
            const x = values.length === 1 ? 50 : index / (values.length - 1) * 100;
            const y = 100 - value / ceiling * 100;
            current.push(`${current.length ? "L" : "M"}${x},${y}`);
        }
    });
    if (current.length) segments.push(current.join(" "));
    return segments;
}
