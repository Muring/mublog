"use client";

import styled from "@emotion/styled";
import { buttonBase, buttonDanger } from "@/styles/button";
import { surface } from "@/styles/surface";
import { mobile } from "@/styles/breakpoints";

/**
 * 확인 대화상자.
 *
 * 브라우저의 confirm() 을 대신한다. 그쪽은 테마도 폰트도 우리 것이 아니고,
 * 문구를 꾸밀 수 없으며, 떠 있는 동안 페이지의 자바스크립트가 통째로 멈춘다.
 */

export const ConfirmOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    /* Header 의 Overlay 와 같은 이유로 토큰을 쓰지 않는다.
       뒤를 가리는 막이라 두 테마 모두 검정이어야 한다 */
    background-color: rgba(0, 0, 0, 0.5);

    animation: confirm-fade 0.12s ease-out;
    @keyframes confirm-fade {
        from {
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;

export const ConfirmBox = styled.div`
    width: min(24rem, 100%);
    padding: 1.25rem;
    ${surface("0.75rem")}
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);

    h3 {
        font-size: 1rem;
        font-weight: 800;
        color: var(--foreground);
        line-height: 1.5;
        /* 한글이 "삭제할 / 까요" 처럼 끊기지 않게 한다 */
        word-break: keep-all;
        overflow-wrap: break-word;
    }

    p {
        margin-top: 0.5rem;
        font-size: 0.85rem;
        line-height: 1.7;
        color: var(--desccolor);
        white-space: pre-line;
        word-break: keep-all;
        overflow-wrap: break-word;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1.25rem;
    }

    button {
        ${buttonBase}
        padding: 0.45rem 0.9rem;
        font-size: 0.82rem;
    }

    button.danger {
        ${buttonDanger}
        padding: 0.45rem 0.9rem;
        font-size: 0.82rem;
    }

    /* 좁은 화면에서는 두 버튼이 가로를 반씩 나눠 갖는다 */
    ${mobile} {
        .actions {
            flex-direction: column-reverse;
        }
        button {
            width: 100%;
        }
    }
`;
