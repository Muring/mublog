"use client";

import styled from "@emotion/styled";
import { pills } from "@/styles/segmented";

export const Pills = styled.div`
    ${pills}
`;

export const Plot = styled.div`
    --axis-w: 2rem;
    position: relative;
    height: var(--plot-h);
    /* 최댓값 라벨이 꼭짓점 위에 앉을 자리 */
    padding-top: 1.1rem;

    /* 눈금선. 데이터가 아니므로 한 단계 물러난 실선 1px */
    .gridline {
        position: absolute;
        left: var(--axis-w);
        right: 0;
        height: 1px;
        background-color: var(--bordercolor);
        opacity: 0.5;
        pointer-events: none;
    }
    /* 0 선은 기준선이라 조금 더 또렷하게 둔다 */
    .gridline[data-base="true"] {
        opacity: 1;
    }
    .gridline span {
        position: absolute;
        right: calc(100% + 0.4rem);
        top: -0.5em;
        font-size: 0.65rem;
        line-height: 1;
        color: var(--desccolor);
        font-variant-numeric: tabular-nums;
    }

    /* 선과 툴팁에 같은 좌표계를 적용한다. */
    .series {
        position: absolute;
        left: var(--axis-w);
        right: 0;
        top: 1.1rem;
        bottom: 0;
    }
    /*
     * preserveAspectRatio 를 none 으로 두고 0~100 좌표계를 상자에 늘려 붙인다.
     * 선까지 같이 늘어나면 굵기가 단위마다 달라지므로 non-scaling-stroke 로 막는다.
     * 끝점의 선 굵기 절반이 잘리지 않도록 overflow 는 열어 둔다.
     */
    svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
    }
    .line {
        fill: none;
        stroke: var(--chartbar);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    /* 채움은 선 아래가 "쌓인 양" 임을 거들 뿐이라 아주 옅게만 깐다 */
    .area {
        fill: var(--chartbar);
        opacity: 0.14;
        stroke: none;
    }
`;

export const Axis = styled.div`
    position: relative;
    /* --axis-h 와 같은 값이어야 .empty 가 그림과 정확히 같은 높이가 된다 */
    height: 0.9rem;
    margin-top: 0.4rem;
    margin-left: 2rem;

    span {
        position: absolute;
        left: var(--x);
        transform: translateX(-50%);
        font-size: 0.65rem;
        color: var(--desccolor);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        /* 눈금을 전부 적으면 서로 겹친다. 표시할 것만 남긴다 */
        display: none;
    }
    span[data-show="true"] {
        display: block;
    }
    span[data-edge="first"] {
        transform: none;
    }
    span[data-edge="last"] {
        transform: translateX(-100%);
    }
`;
