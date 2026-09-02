import { css } from "@emotion/react";

/**
 * 글자 자르기 공통 스타일.
 *
 * 한 줄 말줄임 세 줄이 다섯 파일 여섯 자리에 되풀이되고 있었다.
 * 세 줄 중 하나만 빠져도(특히 `min-width: 0`이 없는 flex 자식에서는)
 * 잘리지 않고 옆을 밀어내므로, 한 덩어리로 묶어 둔다.
 */

/** 한 줄로 자르고 말줄임표. 부모가 flex·grid 면 `min-width: 0` 이 함께 필요하다. */
export const truncate = css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

/**
 * 여러 줄로 자르기.
 *
 * 한글은 기본적으로 음절 사이에서 끊겨 "뜯어보 / 기" 처럼 한 글자만 남는다.
 * keep-all 로 띄어쓰기에서만 끊고, 혼자서도 한 줄에 못 들어가는
 * 단어(ContentDocumentLink)는 break-word 가 받아준다. 둘은 늘 같이 간다.
 */
export const clampLines = (lines: number) => css`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: ${lines};
    line-clamp: ${lines};
    overflow: hidden;
    word-break: keep-all;
    overflow-wrap: break-word;
`;
