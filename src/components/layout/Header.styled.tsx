import styled from "@emotion/styled";
import { fadeSlide, scrim } from "@/styles/motion";
import { truncate } from "@/styles/text";
import { mobile } from "@/styles/breakpoints";
import { headerControl } from "@/styles/button";

export const HeaderWrapper = styled.header<{ scrollRatio: number }>`
    background-color: var(--background);
    color: var(--foreground);

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

            ${truncate}

            font-size: 0.95rem;
            font-weight: 600;

            ${(props) =>
                fadeSlide({
                    visible: props.scrollRatio > 0,
                    hiddenY: -6,
                    durationMs: 200,
                })}
        }

        .header-right {
            display: flex;
            align-items: center;
            flex-shrink: 0;
        }

        .fast-route-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;

            /* 기본: 보임 */
            ${fadeSlide({ visible: true, hiddenY: -6, durationMs: 200 })}
        }

        /* 모바일 기준선에서 fast-route-container만 부드럽게 숨김 */
        ${mobile} {
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
        transition: background-color 0.1s ease-in-out;

        &:hover {
            background-color: var(--hovercolor);
        }
        /* 호버 면은 다크에서도 밝은 회색이라, 반전돼 흰색이 된 아이콘을 도로 어둡게 돌린다 */
        html.dark &:hover .auto-dark {
            filter: invert(0) brightness(1) !important;
        }
    }
`;

export const DiagonalLine = styled.div`
    height: 28px;
    width: 1px;
    /* OS 설정(prefers-color-scheme)으로 색을 갈랐더니 사용자가 고른 테마와
       어긋났다. 다른 구분선과 같은 토큰을 쓴다 */
    background-color: var(--bordercolor);
    transform: rotate(30deg);
`;

export const Overlay = styled.div`
    ${scrim()}
    z-index: 99;
`;

export const ButtonWrapper = styled.div`
    /* 인라인 아이콘(닫기)이 currentColor 로 따라온다 */
    .menu-button {
        ${headerControl}
        /* 블록 안에 홀로 서므로 inline-flex 의 글자 줄 여백이 생기지 않게 블록으로 둔다 */
        display: flex;
        width: 3rem;
        padding: 0;

        html.dark &:hover .auto-dark {
            filter: invert(0) brightness(1) !important;
        }
    }
`;
