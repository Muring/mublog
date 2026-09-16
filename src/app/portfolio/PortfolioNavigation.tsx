"use client";

import { useEffect, useState } from "react";
import styles from "./portfolio.module.css";

type NavigationItem = { id: string; label: string };

export default function PortfolioNavigation({ items }: { items: NavigationItem[] }) {
    const [activeId, setActiveId] = useState("portfolio-top");

    useEffect(() => {
        let frame = 0;
        const sections = items.map((item) => document.getElementById(item.id));
        const updatePosition = () => {
            frame = 0;
            let current = items[0].id;
            const threshold = Math.min(window.innerHeight * 0.3, 200);
            sections.forEach((section, index) => {
                if (section && section.getBoundingClientRect().top <= threshold) {
                    current = items[index].id;
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
    }, [items]);

    return (
        <nav className={styles.portfolioNavigation} aria-label="포트폴리오 목차">
            <p className={styles.navigationTitle}>목차</p>
            <ol className={styles.navigationList}>
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            aria-current={activeId === item.id ? "location" : undefined}
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ol>
            <a className={styles.navigationTop} href="#portfolio-top">맨 위로</a>
        </nav>
    );
}
