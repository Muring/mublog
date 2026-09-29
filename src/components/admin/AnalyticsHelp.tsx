"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./Analytics.module.css";

/** 카드 높이를 바꾸지 않는 공통 집계 안내 팝오버. */
export default function AnalyticsHelp({ title, children, controls }: { title: string; children: ReactNode; controls?: ReactNode }) {
    const [open, setOpen] = useState(false);
    const id = useId();
    const root = useRef<HTMLDivElement>(null);
    const button = useRef<HTMLButtonElement>(null);
    const pointerType = useRef("");
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    function cancelClose() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }
    function show() {
        cancelClose();
        setOpen(true);
    }
    function leave() {
        cancelClose();
        // 버튼과 설명 사이의 간격을 건너갈 때 설명이 사라지지 않게 한다.
        closeTimer.current = setTimeout(() => {
            if (!button.current?.matches(":focus-visible")) setOpen(false);
        }, 150);
    }
    useEffect(() => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }, []);
    useEffect(() => {
        if (!open) return;
        const closeOutside = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) { cancelClose(); setOpen(false); }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") { cancelClose(); setOpen(false); }
        };
        document.addEventListener("pointerdown", closeOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);
    return <div ref={root} className={styles.helpRoot} onBlur={() => { cancelClose(); setOpen(false); }}>
        <div className={styles.toolbar}>
            <div className={styles.helpHeading}>
                <h3>{title}</h3>
                <button ref={button} type="button" className={styles.helpButton} aria-label={`${title} 집계 기준`} aria-expanded={open} aria-controls={id} aria-describedby={open ? id : undefined} onPointerEnter={event => { if (event.pointerType === "mouse") show(); }}
                    onPointerLeave={event => { if (event.pointerType === "mouse") leave(); }}
                    onPointerDown={event => { pointerType.current = event.pointerType; }}
                    onFocus={event => { if (event.currentTarget.matches(":focus-visible")) show(); }}
                    onClick={event => {
                        cancelClose();
                        if (event.detail !== 0 && pointerType.current === "touch") setOpen(value => !value);
                        else show();
                    }}>
                    집계 기준 <span aria-hidden="true">ⓘ</span>
                </button>
            </div>
            {controls}
        </div>
        <div id={id} role="tooltip" hidden={!open} className={styles.helpBody} onPointerEnter={cancelClose} onPointerLeave={event => { if (event.pointerType === "mouse") leave(); }}>{children}</div>
    </div>;
}
