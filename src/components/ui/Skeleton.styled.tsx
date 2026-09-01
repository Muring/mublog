"use client";

import styled from "@emotion/styled";

/**
 * 불러오는 동안 자리를 지키는 회색 블록.
 *
 * 값이 늦게 오는 자리를 빈칸으로 두면 "없는 것" 처럼 보이다가 갑자기 튀어나온다.
 * 같은 크기의 회색 블록을 먼저 깔아 "오는 중" 으로 읽히게 한다.
 * 실제와 크기를 맞춰야 값이 도착할 때 화면이 흔들리지 않는다.
 */
export const Skeleton = styled.div`
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
