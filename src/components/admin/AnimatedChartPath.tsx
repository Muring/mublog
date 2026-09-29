"use client";

import { useLayoutEffect, useRef } from "react";
import { chartMorph } from "@/lib/chart-morph";

/** React 상태를 프레임마다 갱신하지 않고 선의 좌표만 보간한다. */
export default function AnimatedChartPath({ d }: { d: string }) {
    const path = useRef<SVGPathElement>(null);
    const current = useRef(d);
    useLayoutEffect(() => {
        const element = path.current;
        if (!element) return;
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let frame = 0;
        const draw = (value: string) => {
            current.current = value;
            element.setAttribute("d", value);
        };
        const finish = () => { cancelAnimationFrame(frame); draw(d); };
        if (motion.matches || document.hidden || current.current === d) {
            finish();
            return;
        }
        const interpolate = chartMorph(current.current, d);
        const start = performance.now();
        draw(current.current);
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / 360);
            draw(interpolate(1 - (1 - progress) ** 3));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        const visibility = () => { if (document.hidden) finish(); };
        const reducedMotion = () => { if (motion.matches) finish(); };
        document.addEventListener("visibilitychange", visibility);
        motion.addEventListener("change", reducedMotion);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("visibilitychange", visibility);
            motion.removeEventListener("change", reducedMotion);
        };
    }, [d]);
    return <path ref={path} className="line" d={d} vectorEffect="non-scaling-stroke" />;
}
