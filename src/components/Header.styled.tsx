import styled from "@emotion/styled";

export const HeaderWrapper = styled.header<{ scrollRatio: number }>`
    background-color: var(--background);
    color: var(--foreground);

    @media (prefers-color-scheme: dark) {
        background-color: var(--background);
        color: var(--foreground);
    }

    position: fixed;
    top: 0;
    z-index: 50;
    justify-content: center;
    align-items: center;
    width: 100%;

    nav {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 1280px;
        padding: 0 1rem;
        height: 64px;
        margin: 0 auto;

        .menu {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
            padding: 0.5rem;
        }

        .header-center-title {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);

            max-width: min(60vw, 720px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            pointer-events: none;
            font-size: 0.95rem;
            font-weight: 600;

            /* 스크롤 맨 위(0)에서는 숨김, 내려가면 표시 */
            opacity: ${({ scrollRatio }) => (scrollRatio === 0 ? 0 : 1)};
            visibility: ${({ scrollRatio }) => (scrollRatio === 0 ? "hidden" : "visible")};
            transform: translate(-50%, -50%) translateY(${({ scrollRatio }) => (scrollRatio === 0 ? "-6px" : "0")});

            transition: opacity 200ms ease, transform 200ms ease,
                visibility 0ms linear ${({ scrollRatio }) => (scrollRatio === 0 ? "200ms" : "0ms")};
        }

        .fast-route-container {
            display: flex;
            align-items: center;
            gap: 1rem;

            /* 기본 상태(보임) */
            opacity: 1;
            transform: translateY(0);
            visibility: visible;
            pointer-events: auto;

            /* 전환 설정 */
            transition: opacity 200ms ease, transform 200ms ease, visibility 0ms linear 0ms;
        }

        @media (max-width: 765px) {
            .fast-route-container {
                /* 부드럽게 사라짐 */
                opacity: 0;
                transform: translateY(-6px);
                visibility: hidden;
                pointer-events: none;

                /* visibility는 opacity 애니메이션 끝난 뒤에 숨기기 */
                transition: opacity 200ms ease, transform 200ms ease, visibility 0ms linear 200ms;
            }
        }

        /* 밑줄 효과 */
        &::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%) scaleX(${({ scrollRatio }) => scrollRatio});
            transform-origin: center;
            width: 100%;
            max-width: 1280px;
            height: 2px;
            background-color: var(--foreground);
            transition: transform 0.2s ease-out;
            pointer-events: none;
        }
    }

    h1 {
        font-size: 1.25rem;
        font-weight: bold;
    }

    a {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0.5rem;
        width: 3rem;
        height: 3rem;

        &:hover {
            background-color: var(--hovercolor);
            transition: 0.1s ease-in-out;
        }
    }
`;

export const DiagonalLine = styled.div`
    height: 28px;
    width: 1px;
    background-color: #d4d4d8; //
    transform: rotate(30deg);

    @media (prefers-color-scheme: dark) {
        background-color: #3f3f46;
    }
`;

export const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4); // 반투명 검정색
    z-index: 99;
`;

export const ButtonWrapper = styled.div`
    .menu-button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 3rem;
        height: 3rem;
        border-radius: 0.5rem;

        &:hover {
            background-color: var(--hovercolor);
            transition: 0.1s ease-in-out;
        }
    }
`;
