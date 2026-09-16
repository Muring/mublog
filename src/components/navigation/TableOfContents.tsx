"use client";

import { useEffect, useRef, useState } from "react";
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
    const navigationRef = useRef<HTMLElement>(null);

    useEffect(() => {
        let frame = 0;
        const flatItems = flattenItems(items);
        const sections = flatItems.map((item) => document.getElementById(item.id));
        const updatePosition = () => {
            frame = 0;
            let current = topId;
            const threshold = Math.min(window.innerHeight * 0.3, 200);
            sections.forEach((section, index) => {
                if (section && section.getBoundingClientRect().top <= threshold) {
                    current = flatItems[index].id;
                }
            });
            setActiveId(current);
        };
        const scheduleUpdate = () => {
            if (!frame) frame = window.requestAnimationFrame(updatePosition);
        };
        scheduleUpdate();
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
        };
    }, [items, topId]);

    useEffect(() => {
        const nav = navigationRef.current;
        const active = nav?.querySelector<HTMLElement>('[aria-current="location"]');
        if (!nav || !active) return;
        const container = nav.getBoundingClientRect();
        const link = active.getBoundingClientRect();
        if (link.top < container.top || link.bottom > container.bottom) {
            nav.scrollTop += link.top - container.top - nav.clientHeight / 2;
        }
    }, [activeId]);

    const renderItems = (entries: NavigationItem[]) => (
        <ol className={styles.navigationList}>
            {entries.map((item) => (
                <li key={item.id}>
                    <a
                        href={`#${item.id}`}
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
        <nav ref={navigationRef} className={styles.navigation} aria-label={label}>
            <p className={styles.navigationTitle}>목차</p>
            {renderItems(items)}
            <a className={styles.navigationTop} href={`#${topId}`}>맨 위로</a>
        </nav>
    );
}
