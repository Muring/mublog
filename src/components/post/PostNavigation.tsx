"use client";

import { useEffect, useState } from "react";
import TableOfContents, { type NavigationItem } from "@/components/navigation/TableOfContents";
import styles from "./PostNavigation.module.css";

export default function PostNavigation({ html }: { html: string }) {
    const [items, setItems] = useState<NavigationItem[]>([]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const headings = document.querySelectorAll<HTMLElement>(
                "#post-body h1, #post-body h2, #post-body h3, #post-body h4, #post-body h5, #post-body h6",
            );
            const roots: NavigationItem[] = [];
            const stack: { level: number; item: NavigationItem }[] = [];
            const usedIds = new Set<string>();
            headings.forEach((heading, index) => {
                const label = heading.textContent?.trim();
                if (!label) return;
                let id = heading.id;
                if (!id || usedIds.has(id)) {
                    id = `post-heading-${index + 1}`;
                    while (document.getElementById(id)) id += "-section";
                    heading.id = id;
                }
                usedIds.add(id);
                const level = Number(heading.tagName.slice(1));
                const item: NavigationItem = { id, label };
                while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
                const parent = stack[stack.length - 1]?.item;
                if (parent) (parent.children ??= []).push(item);
                else roots.push(item);
                stack.push({ level, item });
            });
            setItems(roots);
        });
        return () => cancelAnimationFrame(frame);
    }, [html]);

    if (!items.length) return null;

    return (
        <div className={styles.postNavigation}>
            <TableOfContents items={items} topId="post-top" label="본문 목차" />
        </div>
    );
}
