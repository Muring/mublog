"use client";
import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./AiDashboard.module.css";

const GAP = 8;
const MIN_SIDE_WIDTH = 200;

/** Secondary explanations stay in the DOM but open only on hover or focus.
 *  The tip opens beside the icon when the viewport has room, otherwise below the title row. */
export default function Info({ label = "설명 보기", children }: { label?: string; children: ReactNode }) {
    const id = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tipRef = useRef<HTMLSpanElement>(null);
    const [side, setSide] = useState<CSSProperties>();
    const place = () => {
        const button = buttonRef.current, tip = tipRef.current;
        if (!button || !tip?.offsetParent) return;
        const parent = tip.offsetParent.getBoundingClientRect();
        const icon = button.getBoundingClientRect();
        const room = document.documentElement.clientWidth - 16 - icon.right - GAP;
        setSide(room >= MIN_SIDE_WIDTH ? { left: icon.right - parent.left + GAP, top: icon.top - parent.top, maxWidth: Math.min(384, room) } : undefined);
    };
    return <span className={styles.info} onPointerEnter={place} onFocus={place}>
        <button ref={buttonRef} type="button" className={styles.infoButton} aria-label={label} aria-describedby={id}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8" cy="4.9" r=".85" fill="currentColor" /></svg>
        </button>
        <span ref={tipRef} role="tooltip" id={id} className={styles.infoTip} data-side={side ? "" : undefined} style={side}>{children}</span>
    </span>;
}
