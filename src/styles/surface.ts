import { css } from "@emotion/react";

/**
 * 면(카드·입력창·칩) 공통 스타일.
 *
 * `테두리 + 모서리 + 카드 배경` 세 줄이 다섯 파일 일곱 자리에 되풀이되고 있었다.
 * 버튼은 styles/button.ts 로 이미 묶여 있는데 면만 빠져 있었다.
 *
 * 테마 토큰을 쓰는 부분을 한 곳에서 정해야, 토큰이 바뀌었을 때 일부만
 * 어긋나는 일을 막을 수 있다. 모서리는 자리마다 달라야 해서 인자로 받는다.
 */
export const surface = (radius: string) => css`
    border: 1px solid var(--bordercolor);
    border-radius: ${radius};
    background-color: var(--cardbackground);
`;

/**
 * 호버하면 면이 밝아지고 그 위 글자가 어두워지는 짝.
 *
 * --hovercolor 는 양 테마 모두 밝은 회색이다. 그래서 다크에서도 호버하면
 * 면이 밝아지고, 그 위 글자는 반드시 어두워져야 한다. 자식이 스스로 color 를
 * 정하고 있으면 부모의 상속이 닿지 않아 글자가 사라진다 — 실제로 세 번 났다.
 * 두 줄을 늘 함께 쓰도록 한 덩어리로 묶는다.
 */
export const hoverSurface = css`
    background-color: var(--hovercolor);
    color: var(--hoverfontcolor);
`;

/**
 * 카드가 살짝 떠오르는 호버.
 *
 * 홈 그리드와 캐러셀이 글자까지 똑같은 블록을 각자 갖고 있었다.
 * 두 곳이 같은 카드를 다른 규칙으로 띄우면 화면을 오갈 때 어긋나 보인다.
 */
export const cardHoverLift = css`
    /* !important 는 카드 등장 애니메이션(fadeInUp)이 남긴 transform 을 눌러야 해서다 */
    transform: translateY(-4px) !important;
    box-shadow: 0px 6px 5px -2px var(--shadowcolor);
`;
