import { css } from "@emotion/react";

/**
 * 포트폴리오에서 시작한 링크 모양. 평소에는 옅은 밑줄만 있고, 호버·포커스하면 강조색 선이 왼쪽에서 오른쪽으로 그어진다.
 * 글자색 전환은 쓰는 쪽이 정한다(포트폴리오는 .page a:hover, AI 관리는 인계 링크).
 */
export const animatedLink = css`
    position: relative;
    border-bottom: 1px solid var(--bordercolor);

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 1px;
        background: var(--accent, var(--linkhovercolor));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 280ms ease;
    }
    &:is(:hover, :focus-visible)::after {
        transform: scaleX(1);
    }
    @media (prefers-reduced-motion: reduce) {
        &::after { transition: none; }
    }
`;
