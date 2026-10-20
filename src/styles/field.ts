import { css } from "@emotion/react";
import { surface } from "@/styles/surface";

/**
 * 글을 써 넣는 칸(input·textarea) 공통 스타일.
 *
 * 테두리·면·글자색이 여섯 자리에 따로 있었고, 호버하면 테두리가 진해지는 칸(관리 필터)과
 * 아무 반응이 없는 칸(에디터·댓글·이미지 검색)이 섞여 있었다. 누를 수 있는 것은 전부 호버가 있어야 한다(AGENTS §3).
 *
 * font 전체가 아니라 font-family 만 물려받는다. 라벨 안에 놓인 칸(에디터)은 font 를 통째로 물려받으면
 * 라벨의 굵기까지 따라온다. 크기·안쪽 여백·면 색은 자리마다 달라 쓰는 쪽이 정한다.
 */
export const textField = (radius: string) => css`
    ${surface(radius)}
    color: var(--foreground);
    font-family: inherit;

    &::placeholder {
        color: var(--desccolor);
    }
    &:hover:not(:disabled) {
        border-color: var(--foreground);
    }
`;
