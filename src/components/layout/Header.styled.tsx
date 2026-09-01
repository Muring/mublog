import styled from "@emotion/styled";
import { fadeSlide } from "@/styles/motion";

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
            flex-shrink: 0;
        }

        /*
         * 타이틀: 스크롤 맨 위(0)면 숨김.
         *
         * absolute 로 화면 가운데에 띄우면 좌우 형제의 폭을 알 수 없어서,
         * 화면이 좁아지면 오른쪽 로그인 영역과 글자가 겹쳤다.
         * 흐름 안에 두고 남은 자리를 차지하게 하면 구조적으로 겹칠 수 없다.
         */
        .header-center-title {
            flex: 1 1 auto;
            min-width: 0;
            text-align: center;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            font-size: 0.95rem;
            font-weight: 600;

            ${(props) =>
                fadeSlide({
                    visible: props.scrollRatio > 0,
                    hiddenY: -6,
                    durationMs: 200,
                })}
        }

        .fast-route-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;

            /* 기본: 보임 */
            ${fadeSlide({ visible: true, hiddenY: -6, durationMs: 200 })}
        }

        /* 765px 이하: fast-route-container만 부드럽게 숨김 */
        @media (max-width: 765px) {
            .fast-route-container {
                ${fadeSlide({ visible: false, hiddenY: -6, durationMs: 200 })}
                /* visibility 만 끄면 자리는 그대로 남아 타이틀이 쓸 폭을 잡아먹는다 */
                display: none;
            }

            .menu {
                gap: 0;
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
        /* 인라인 아이콘이 currentColor 로 따라온다 */
        color: var(--foreground);

        &:hover {
            background-color: var(--hovercolor);
            /* --hovercolor 는 양 테마 모두 밝은 회색이라 글자색도 같이 뒤집어야 한다 */
            color: var(--hoverfontcolor);
            transition: 0.1s ease-in-out;
        }
    }
`;
