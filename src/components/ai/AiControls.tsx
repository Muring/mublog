"use client";
import styled from "@emotion/styled";
import { thinScrollbar } from "@/styles/scrollbar";
import { listTableBase } from "@/styles/list-table";
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
    &::-webkit-scrollbar-corner { background: transparent; }
    textarea { ${thinScrollbar()} }
`;
export const number = (value: number) => value.toLocaleString("ko-KR");
export type Tone = "ok" | "warn" | "danger" | "neutral";
/** Status chip matching the blog's post status badges; tone picks the ok/warn/danger token set. */
export const AiBadge = styled.span`
    ${statusBadgeBase}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    /* 높이를 고정하고 줄 높이를 1 로 두어 한글이 배지 안에서 위아래 가운데에 온다. 글 줄 옆에서는 가운데로 맞춘다 */
    box-sizing: border-box;
    height: 1.375rem;
    padding-block: 0;
    line-height: 1;
    vertical-align: middle;
    &[data-tone="ok"] { color: var(--okcolor); background: var(--okbg); border-color: var(--okborder); }
    &[data-tone="warn"] { color: var(--warncolor); background: var(--warnbg); border-color: var(--warnborder); }
    &[data-tone="danger"] { color: var(--dangercolor); border-color: var(--dangercolor); }
    &[data-tone="neutral"] { color: var(--desccolor); }
`;

export const AiRecordTable = styled.table`
    ${listTableBase}
`;
