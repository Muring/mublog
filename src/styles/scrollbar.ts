import { css } from "@emotion/react";

/**
 * 안쪽 스크롤 상자의 가는 막대. 관리 목록(AdminListScroll)과 드롭다운 목록이 같이 쓴다.
 *
 * body 막대는 아예 감춰 두었는데(globals.css) 안쪽 상자는 "여기가 제 안에서 스크롤한다" 는
 * 사실이 보여야 해서 직접 그린다. 기본 막대는 OS 모양(화살표·회색 트랙)이라 블로그와 어긋난다.
 *
 * 두께는 트랙과 같게 두고 바탕색 테두리로 깎는다 — 막대에 padding 을 줄 방법이 없어서,
 * 바탕색 띠를 둘러 가늘고 둥근 막대로 보이게 하는 방식이다. 그래서 바탕색을 인자로 받는다
 * (상자 바탕과 다르면 막대 둘레에 다른 색 띠가 보인다).
 */
export const thinScrollbar = (surface = "var(--background)") => css`
    &::-webkit-scrollbar {
        width: 10px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: var(--bordercolor);
        border-radius: 999px;
        border: 3px solid ${surface};
    }
    &::-webkit-scrollbar-thumb:hover {
        background-color: var(--desccolor);
    }

    /*
     * 표준 속성은 ::-webkit-scrollbar 를 모르는 브라우저에만 준다.
     * 크롬은 scrollbar-width 가 지정되면 위 가상 요소를 무시하므로,
     * 둘을 같이 적으면 애써 그린 막대가 사라진다.
     */
    @supports not selector(::-webkit-scrollbar) {
        scrollbar-width: thin;
        scrollbar-color: var(--bordercolor) transparent;
    }
`;
