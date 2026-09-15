import styled from "@emotion/styled";
import Image from "next/image";
import { mobile } from "@/styles/breakpoints";

export const Frame = styled.div`
    position: relative;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--codefontbgcolor);
`;

/**
 * 슬라이드는 스크롤 스냅으로 넘긴다.
 *
 * 폭을 JS 로 재지 않는다. 각 슬라이드가 100% 를 차지하고 브라우저가 스냅하므로
 * 하이드레이션 전에도 첫 장이 제 크기로 그려진다. 화살표·점은 scrollLeft 만 읽는다.
 */
export const Track = styled.div`
    display: flex;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

/**
 * 좌우에 화살표가 앉을 홈통(--gutter)을 비워 둔다.
 * 화살표를 그림 위에 얹으면 어떤 장면에서는 내용을 가린다 — 그래서 그림은
 * 홈통 안쪽에만 그리고 화살표는 홈통에만 둔다. 둘이 겹칠 일이 없다.
 */
export const Slide = styled.div`
    --gutter: 2.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.25rem;
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    padding: 1.25rem var(--gutter) 1.75rem;
    scroll-snap-align: start;

    ${mobile} {
        --gutter: 2rem;
        gap: 0.6rem;
        padding: 0.75rem var(--gutter) 1.5rem;
    }
`;

/** 슬라이드 안에서 비율을 지키며 들어간다. 세로 화면이 여러 장이면 나란히 선다 */
export const Shot = styled(Image)`
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    min-width: 0;
    object-fit: contain;
    border-radius: 6px;
`;

/** 홈통 한가운데 놓이는 맨 화살표. 면도 테두리도 없이 선만 둔다 */
export const Arrow = styled.button`
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    padding: 0;
    border: 0;
    background: none;
    color: var(--desccolor);
    cursor: pointer;
    transition: color 0.15s ease-in-out;

    &:hover:not(:disabled) {
        color: var(--foreground);
    }

    &:disabled {
        opacity: 0.25;
        cursor: default;
    }

    &[data-dir="prev"] {
        left: 0;
    }

    &[data-dir="next"] {
        right: 0;
    }

    ${mobile} {
        width: 2rem;
    }
`;

export const Dots = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.6rem;
    display: flex;
    justify-content: center;
    gap: 0.4rem;

    button {
        width: 0.5rem;
        height: 0.5rem;
        padding: 0;
        border: 1px solid var(--bordercolor);
        border-radius: 50%;
        background-color: var(--cardbackground);
        cursor: pointer;
        transition: background-color 0.15s ease-in-out;
    }

    button[aria-current="true"] {
        background-color: var(--foreground);
        border-color: var(--foreground);
    }
`;
