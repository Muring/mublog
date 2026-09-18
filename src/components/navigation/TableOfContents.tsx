"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import styles from "./TableOfContents.module.css";

export type NavigationItem = {
    id: string;
    label: string;
    children?: NavigationItem[];
};

function flattenItems(items: NavigationItem[]): NavigationItem[] {
    return items.flatMap((item) => [item, ...flattenItems(item.children ?? [])]);
}

export default function TableOfContents({ items, topId, label = "목차" }: {
    items: NavigationItem[];
    topId: string;
    label?: string;
}) {
    const [activeId, setActiveId] = useState(items[0]?.id ?? "");
    // 좁은 화면(인라인 배치)에서만 의미 있는 접힘 상태. 고정 패널 모드에서는 CSS 가 무시한다.
    const [open, setOpen] = useState(false);
    const bodyId = useId();
    const navigationRef = useRef<HTMLElement>(null);
    const clickedTarget = useRef<string | null>(null);

    useEffect(() => {
        let frame = 0;
        let settleTimer: ReturnType<typeof setTimeout> | undefined;
        const flatItems = flattenItems(items);
        const sections = flatItems.map((item) => document.getElementById(item.id));
        const updatePosition = () => {
            frame = 0;
            if (clickedTarget.current) return;
            let current = topId;
            const threshold = Math.min(window.innerHeight * 0.3, 200);
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            sections.forEach((section, index) => {
                if (!section) return;
                // The final section may never reach the reading line near the page bottom.
                const sectionTop = section.getBoundingClientRect().top + window.scrollY;
                const activationPoint = Math.min(sectionTop - threshold, maxScroll);
                if (window.scrollY >= activationPoint - 1) {
                    current = flatItems[index].id;
                }
            });
            setActiveId(current);
        };
        const scheduleUpdate = () => {
            clearTimeout(settleTimer);
            if (clickedTarget.current) {
                // Keep the clicked destination highlighted throughout smooth scrolling.
                // Release without reclassifying the final position until the next scroll.
                settleTimer = setTimeout(() => { clickedTarget.current = null; }, 200);
            }
            if (!frame) frame = window.requestAnimationFrame(updatePosition);
        };
        const resumeTracking = () => {
            clickedTarget.current = null;
            clearTimeout(settleTimer);
            scheduleUpdate();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
                resumeTracking();
            }
        };
        scheduleUpdate();
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", resumeTracking);
        window.addEventListener("wheel", resumeTracking, { passive: true });
        window.addEventListener("touchmove", resumeTracking, { passive: true });
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            clearTimeout(settleTimer);
            window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", resumeTracking);
            window.removeEventListener("wheel", resumeTracking);
            window.removeEventListener("touchmove", resumeTracking);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [items, topId]);

    useEffect(() => {
        const nav = navigationRef.current;
        const active = nav?.querySelector<HTMLElement>('[aria-current="location"]');
        if (!nav || !active || nav.scrollHeight <= nav.clientHeight) return;
        const container = nav.getBoundingClientRect();
        const link = active.getBoundingClientRect();
        if (link.top < container.top || link.bottom > container.bottom) {
            nav.scrollTop += link.top - container.top - nav.clientHeight / 2;
        }
    }, [activeId]);

    const handleNavigation = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        clickedTarget.current = id;
        setActiveId(id);
        setOpen(false);
    };

    const renderItems = (entries: NavigationItem[]) => (
        <ol className={styles.navigationList}>
            {entries.map((item) => (
                <li key={item.id}>
                    <a
                        href={`#${item.id}`}
                        onClick={(event) => handleNavigation(event, item.id)}
                        aria-current={activeId === item.id ? "location" : undefined}
                    >
                        {item.label}
                    </a>
                    {item.children?.length ? renderItems(item.children) : null}
                </li>
            ))}
        </ol>
    );

    return (
        <nav ref={navigationRef} className={styles.navigation} aria-label={label} data-toc>
            <p className={styles.navigationTitle} data-toc-title>목차</p>
            <button
                type="button"
                className={styles.navigationToggle}
                data-toc-toggle
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() => setOpen((value) => !value)}
            >
                목차
            </button>
            <div id={bodyId} className={styles.navigationBody} data-toc-body data-collapsed={open ? undefined : ""}>
                {renderItems(items)}
                <a className={styles.navigationTop} data-toc-top href={`#${topId}`} onClick={(event) => handleNavigation(event, topId)}>맨 위로</a>
            </div>
        </nav>
    );
}
