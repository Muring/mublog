"use client";
import styled from "@emotion/styled";
import { thinScrollbar } from "@/styles/scrollbar";
import { segmented } from "@/styles/segmented";
import { statusBadgeBase } from "@/styles/status-badge";

export const AiSegments = styled.div`
    ${segmented};
    flex-wrap: nowrap;
    button:focus:not(:focus-visible) { outline: none; }
    button:focus-visible { outline: 2px solid var(--foreground); outline-offset: -2px; }
`;
export const AiScroll = styled.div`
    ${thinScrollbar()}
    &::-webkit-scrollbar { height: 10px; }
    textarea { ${thinScrollbar()} }
`;
export const number = (value: number) => value.toLocaleString("ko-KR");
export type Tone = "ok" | "warn" | "danger" | "neutral";
/** Status chip matching the blog's post status badges; tone picks the ok/warn/danger token set. */
export const AiBadge = styled.span`
    ${statusBadgeBase}
    &[data-tone="ok"] { color: var(--okcolor); background: var(--okbg); border-color: var(--okborder); }
    &[data-tone="warn"] { color: var(--warncolor); background: var(--warnbg); border-color: var(--warnborder); }
    &[data-tone="danger"] { color: var(--dangercolor); border-color: var(--dangercolor); }
    &[data-tone="neutral"] { color: var(--desccolor); }
`;
