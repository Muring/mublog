"use client";
import { useState, type CSSProperties, type TransitionEvent } from "react";
import styles from "./AiDashboard.module.css";

// Three 0-9 cycles so a digit can keep rolling one way past 9→0; it rests in the middle cycle.
const STRIP = Array.from({ length: 30 }, (_, i) => i % 10);
const REST = 10;

type Direction = "up" | "down";

function Digit({ digit, direction }: { digit: number; direction: Direction }) {
    const [state, setState] = useState({ digit, pos: REST + digit, still: false });
    if (state.digit !== digit) {
        // Rising values roll every digit upward (wrapping 9→0), falling values roll downward.
        const pos = direction === "up"
            ? REST + digit + (digit < state.digit ? 10 : 0)
            : REST + digit - (digit > state.digit ? 10 : 0);
        setState({ digit, pos, still: false });
    }
    // After a wrap the strip sits in an outer cycle; jump back to the same digit in the middle one.
    const settle = (event: TransitionEvent) => {
        if (event.target !== event.currentTarget) return;
        setState(s => s.pos === REST + s.digit ? s : { ...s, pos: REST + s.digit, still: true });
    };
    return <span className={styles.digit}>
        <span className={styles.digitSizer}>{digit}</span>
        <span className={styles.digitStrip} data-still={state.still || undefined} style={{ "--pos": state.pos } as CSSProperties} onTransitionEnd={settle}>{STRIP.map((d, i) => <span key={i}>{d}</span>)}</span>
    </span>;
}

/** Odometer-style value: every digit rolls the same way as the change, other characters stay put.
 *  The font has proportional digits, so the current digit sizes its column and the strip is centred over it. */
export default function RollingNumber({ value }: { value: string }) {
    const numeric = Number(value.replace(/[^\d.]/g, ""));
    const [trend, setTrend] = useState<{ value: string; numeric: number; direction: Direction }>({ value, numeric, direction: "up" });
    let direction = trend.direction;
    if (trend.value !== value) {
        direction = numeric < trend.numeric ? "down" : "up";
        setTrend({ value, numeric, direction });
    }
    const chars = Array.from(value);
    return <span className={styles.rolling}>
        <span className={styles.srOnly}>{value}</span>
        <span className={styles.rollingChars} aria-hidden="true">{chars.map((char, index) => {
            // Keyed from the right so ones stay ones when the number gains a digit.
            const place = chars.length - index;
            return /\d/.test(char)
                ? <Digit key={`d${place}`} digit={Number(char)} direction={direction} />
                : <span key={`c${place}`}>{char}</span>;
        })}</span>
    </span>;
}
