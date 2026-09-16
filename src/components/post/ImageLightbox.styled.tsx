"use client";

import styled from "@emotion/styled";

/**
 * 본문 이미지 확대.
 *
 * 뒤를 가리는 막이라 ConfirmOverlay 와 같은 이유로 토큰을 쓰지 않는다 —
 * 두 테마 모두 검정이어야 한다. 이미지는 원본 크기까지만, 화면에 맞춰 줄인다.
 */
export const LightboxOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: rgba(0, 0, 0, 0.92);
    cursor: zoom-out;

    animation: lightbox-fade 0.15s ease-out;
    @keyframes lightbox-fade {
        from {
            opacity: 0;
        }
    }
    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 6px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    figcaption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 1.25rem;
        padding: 0 2rem;
        text-align: center;
        font-size: 0.85rem;
        /* 검정 막 위라 흰 글자로 고정한다 */
        color: #ffffff;
        word-break: keep-all;
    }

    .close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        color: #ffffff;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
    }
    .close:hover,
    .close:focus-visible {
        background: rgba(255, 255, 255, 0.15);
        outline: none;
    }
`;
