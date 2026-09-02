"use client";

import styled from "@emotion/styled";
import { surface } from "@/styles/surface";
import { mobile } from "@/styles/breakpoints";

export const ToastViewport = styled.div`
    position: fixed;
    left: 50%;
    /* 헤더가 fixed / 64px 이므로 그 아래에 띄운다 */
    top: calc(64px + 1rem);
    transform: translateX(-50%);
    z-index: 100;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    /* 목록 자체는 클릭을 가로채지 않고, 각 토스트만 받는다 */
    pointer-events: none;

    ${mobile} {
        left: 1rem;
        right: 1rem;
        transform: none;
        align-items: stretch;
    }
`;

export const ToastItem = styled.div`
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: min(90vw, 28rem);
    padding: 0.7rem 0.9rem;
    ${surface("0.65rem")}
    color: var(--foreground);
    box-shadow: 0 6px 20px var(--shadowcolor);
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.5;

    animation: toast-in 0.18s ease-out;

    /* 성공/실패는 색만이 아니라 왼쪽 띠로도 구분해, 색을 못 보는 상황에서도 읽힌다 */
    border-left: 3px solid var(--desccolor);

    &.success {
        border-left-color: var(--okcolor);
    }
    &.error {
        border-left-color: var(--dangercolor);
    }

    .message {
        flex: 1;
        min-width: 0;
        word-break: break-word;
    }

    .dismiss {
        flex-shrink: 0;
        padding: 0;
        border: none;
        background: none;
        color: var(--desccolor);
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1;
        cursor: pointer;

        &:hover {
            color: var(--foreground);
        }
    }

    @keyframes toast-in {
        from {
            opacity: 0;
            transform: translateY(-0.5rem);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* 움직임을 줄이도록 설정한 사용자에게는 애니메이션을 걷어낸다 */
    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;
