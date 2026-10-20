"use client";

import { useMemo } from "react";
import TableOfContents, { type NavigationItem } from "@/components/navigation/TableOfContents";
import { PostNavigationDock } from "./PostNavigation.styled";

const HEADING = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g;
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function textOf(html: string) {
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (entity, code: string) => {
            if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? entity;
            const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
            return String.fromCodePoint(point);
        })
        .trim();
}

/*
 * 목차를 본문 HTML 문자열에서 바로 뽑는다. 렌더 중에 계산하므로 서버 HTML 에 목차가 함께 실린다.
 * 예전에는 hydration 뒤 DOM 을 읽어 목차를 그려서, 본문 위에 목차가 끼어드는 순간 글 전체가
 * 80px 쯤 밀렸다(CLS). 제목 id 는 렌더 파이프라인의 rehype-slug 가 이미 붙여 둔다 —
 * id 가 없는 제목은 이동할 곳이 없으므로 목차에서 뺀다.
 */
function headingsOf(html: string): NavigationItem[] {
    const roots: NavigationItem[] = [];
    const stack: { level: number; item: NavigationItem }[] = [];
    for (const [, levelText, attributes, inner] of html.matchAll(HEADING)) {
        const id = /\bid="([^"]+)"/.exec(attributes)?.[1];
        const label = textOf(inner);
        if (!id || !label) continue;
        const level = Number(levelText);
        const item: NavigationItem = { id: textOf(id), label };
        while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
        const parent = stack[stack.length - 1]?.item;
        if (parent) (parent.children ??= []).push(item);
        else roots.push(item);
        stack.push({ level, item });
    }
    return roots;
}

export default function PostNavigation({ html }: { html: string }) {
    const items = useMemo(() => headingsOf(html), [html]);

    if (!items.length) return null;

    return (
        <PostNavigationDock>
            <TableOfContents items={items} topId="post-top" label="본문 목차" />
        </PostNavigationDock>
    );
}
