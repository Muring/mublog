import { css } from "@emotion/react";

/**
 * 버튼 공통 스타일.
 *
 * 같은 규칙이 여섯 개의 .styled 파일에 흩어져 있었다. 테두리·배경·hover 처럼
 * 테마 토큰을 쓰는 부분은 한 곳에서 정해야, 토큰이 바뀌었을 때 일부만
 * 어긋나는 일을 막을 수 있다.
 *
 * 크기(padding, font-size)는 자리마다 달라야 하므로 여기서 정하지 않는다.
 * 쓰는 쪽에서 이 조각을 깔고 그 뒤에 덧붙인다.
 */
export const buttonBase = css`
    border: var(--border-width) solid var(--bordercolor);
    border-radius: 0.5rem;
    background-color: var(--cardbackground);
    color: var(--foreground);
    font-family: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: border-color 150ms ease, background-color 0.15s ease-in-out,
        color 0.15s ease-in-out;

    &:hover:not(:disabled) {
        background-color: var(--hovercolor);
        color: var(--hoverfontcolor);
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

/** 관리 컨트롤: 기본 모양은 같고, 호버만 현재 테마의 면 안에서 한 톤 바뀐다. */
export const buttonSubtle = css`
    ${buttonBase}
    &:hover:not(:disabled) {
        background-color: var(--control-hover-bg);
        color: var(--foreground);
    }
`;

/** 정렬·보기 옵션 같은 보조 동작. 테두리 없이 호버와 펼침 상태를 면으로 구분한다. */
export const buttonGhost = css`
    ${buttonBase}
    border-color: transparent;
    background-color: transparent;
    color: var(--foreground);
    font-weight: 400;
    outline: var(--border-width) solid transparent;
    outline-offset: calc(-1 * var(--border-width));

    &:hover:not(:disabled) {
        border-color: transparent;
        outline-color: transparent;
        background-color: var(--control-hover-bg);
        color: var(--foreground);
    }
    &[aria-expanded="true"] {
        border-color: transparent;
        outline-color: transparent;
        background-color: var(--codefontbgcolor);
        color: var(--foreground);
    }
    &[aria-expanded="true"]:hover:not(:disabled) {
        background-color: color-mix(in srgb, var(--foreground) 8%, var(--codefontbgcolor));
    }
    &:focus-visible, &:hover:focus-visible, &[aria-expanded="true"]:focus-visible {
        outline: 2px solid var(--linkhovercolor);
        outline-offset: 2px;
    }
`;

/**
 * 배경을 채우지 않고 테두리만 강조하는 변형.
 *
 * 안쪽 글자색을 강제할 수 없는 자리(아이콘이 섞이거나 색이 제각각인 경우)에 쓴다.
 * --hovercolor 는 다크 모드에서 --foreground 와 거의 같은 색이라
 * 배경을 채우면 내용이 묻힌다.
 */
export const buttonQuiet = css`
    border: var(--border-width) solid var(--bordercolor);
    border-radius: 0.5rem;
    background-color: var(--cardbackground);
    color: var(--foreground);
    font-family: inherit;
    font-weight: 700;
    cursor: pointer;
    /*
     * 호버는 테두리 자리에 outline 을 그린다. 링을 테두리 바깥에 두면 두 선이 겹쳐 2px 두 색이 되므로
     * offset 을 테두리 폭만큼 안으로 넣고 테두리는 투명하게 물린다. outline-style 은 none ↔ solid 를
     * 못 넘어가므로 늘 투명한 링을 깔아두고 색만 바꾼다 — 그래야 전환이 흐른다.
     */
    outline: 1px solid transparent;
    outline-offset: calc(-1 * var(--border-width));
    transition: outline-color 150ms ease, border-color 150ms ease;

    &:hover:not(:disabled) {
        border-color: transparent;
        outline-color: var(--foreground);
    }
    /* 기본 링을 투명으로 덮었으니 키보드 초점은 여기서 따로 살린다 */
    &:focus-visible {
        outline: 2px solid var(--linkhovercolor);
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

/** 주요 동작. 전경/배경을 뒤집어 한 화면에 하나만 둔다. */
export const buttonPrimary = css`
    background-color: var(--activecolor);
    color: var(--activefontcolor);
    border-color: var(--activecolor);
`;

/** 되돌릴 수 없는 동작. hover 에서 색을 잃지 않고 오히려 또렷해진다. */
export const buttonDanger = css`
    color: var(--dangercolor);
    border-color: currentColor;

    &:hover:not(:disabled) {
        background-color: var(--dangercolor);
        border-color: var(--dangercolor);
        color: var(--dangerfontcolor);
    }
`;
