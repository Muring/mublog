"use client";
import styled from "@emotion/styled";
import { thinScrollbar } from "@/styles/scrollbar";
import { segmented } from "@/styles/segmented";

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
