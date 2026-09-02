"use client";

import styled from "@emotion/styled";

/**
 * 불러오는 동안 자리를 지키는 회색 블록.
 *
 * 값이 늦게 오는 자리를 빈칸으로 두면 "없는 것" 처럼 보이다가 갑자기 튀어나온다.
 * 같은 크기의 회색 블록을 먼저 깔아 "오는 중" 으로 읽히게 한다.
 * 실제와 크기를 맞춰야 값이 도착할 때 화면이 흔들리지 않는다.
 */
export const Skeleton = styled.span`
    /*
     * div 가 아니라 span 이다. <p> 안에 놓이는 자리가 있는데(SiteStats),
     * <p> 안의 <div> 는 파서가 <p> 를 강제로 닫아버려 서버가 만든 트리와
     * 브라우저의 DOM 이 갈린다. 그러면 React 가 하이드레이션을 포기하고
     * 전체를 클라이언트에서 다시 그린다 — 느려지는 것은 덤이다.
     * span 은 어디에나 놓을 수 있고, display:block 으로 모양은 그대로다.
     */
    display: block;
    border-radius: 0.4rem;
    background-color: var(--codefontbgcolor);
    animation: skeleton-pulse 1.4s ease-in-out infinite;

    @keyframes skeleton-pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.55;
        }
    }

    /* 움직임을 원치 않는 사용자에게는 깜빡이지 않고 자리만 지킨다 */
    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;
