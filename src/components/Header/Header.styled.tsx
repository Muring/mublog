import styled from "@emotion/styled";

export const HeaderWrapper = styled.header<{ scrollRatio: number }>`
    position: fixed;
    top: 0;
    z-index: 50;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: white;

    nav {
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

        .fast-route-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
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
            background-color: black;
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
            background-color: #eeeeee;
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
