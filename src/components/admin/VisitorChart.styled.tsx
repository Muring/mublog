"use client";

import styled from "@emotion/styled";
import { surface } from "@/styles/surface";

/**
 * 방문자 추이 차트.
 *
 * 막대는 --chartbar 하나만 쓴다. 계열이 하나뿐이라 범례가 필요 없고,
 * 제목이 무엇을 그린 것인지 이미 말한다.
 *
 * 상태색(--okcolor 등)을 데이터에 돌려쓰지 않는다. 그쪽은 "정상/주의" 라는
 * 뜻을 이미 갖고 있어서, 막대에 쓰면 없는 의미가 생긴다.
 */
export const ChartCard = styled.section`
    ${surface("12px")}
    padding: 1.25rem;
    margin-bottom: 2rem;
    container-type: inline-size;

    .chart-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    h3 {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--foreground);
    }

    .range {
        font-size: 0.75rem;
        color: var(--desccolor);
        font-variant-numeric: tabular-nums;
    }

    .empty {
        margin-top: 1.5rem;
        padding: 2rem 0;
        text-align: center;
        font-size: 0.85rem;
        color: var(--desccolor);
    }
`;

/**
 * 막대 영역.
 *
 * 폭 계산을 CSS 에 맡긴다. 막대 수를 --bars 로만 넘기고 나머지는 grid 가 나눈다.
 * 측정값을 JS 상태로 들면 하이드레이션 전에 폭이 0 이라 납작하게 그려진다.
 */
export const Plot = styled.div`
    position: relative;
    margin-top: 1.25rem;
    /* 눈금선이 축 글자 위로 넘치지 않도록 그림 영역과 축을 나눈다 */
    height: 168px;
    display: grid;
    grid-template-columns: repeat(var(--bars), minmax(0, 1fr));
    align-items: end;
    /*
     * 막대가 몇 개뿐일 때 카드 전체로 퍼지면 허전하다.
     * 한 칸이 2.5rem 을 넘지 않게 상한을 걸어 왼쪽부터 채운다.
     * 날이 쌓여 30개가 되면 이 값이 컨테이너보다 커져 자연히 꽉 찬다.
     */
    max-width: calc(var(--bars) * 2.5rem);
    /* 막대 사이 2px 는 배경색이 벌리는 간격이다. 테두리를 그리지 않는다 */
    gap: 2px;

    /* 눈금선. 데이터가 아니므로 한 단계 물러난 실선 1px */
    .gridline {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background-color: var(--bordercolor);
        pointer-events: none;
    }
    .gridline span {
        position: absolute;
        top: -0.85rem;
        left: 0;
        font-size: 0.65rem;
        color: var(--desccolor);
        font-variant-numeric: tabular-nums;
    }
`;

/**
 * 막대 하나.
 *
 * 클릭 대상이 아니라 button 이 아니지만, 키보드로도 값에 닿아야 하므로
 * tabIndex 를 주고 focus-visible 에서도 툴팁이 뜬다.
 */
export const Bar = styled.div`
    position: relative;
    align-self: end;
    width: 100%;
    /* 24px 을 넘기지 않는다. 칸을 가득 채우지 않고 남는 자리는 여백으로 둔다 */
    max-width: 24px;
    justify-self: center;
    height: var(--h);
    /* 값이 0 이어도 자리는 보이게 한다 (그날 아무도 오지 않았다는 사실도 데이터다) */
    min-height: 2px;
    background-color: var(--chartbar);
    /* 위쪽만 둥글고 바닥은 각지게 — 기준선에서 자란다 */
    border-radius: 4px 4px 0 0;
    cursor: default;

    &[data-zero="true"] {
        background-color: var(--bordercolor);
    }

    /* 히트 영역을 막대보다 넓게 잡는다. 2px 막대는 조준할 수 없다 */
    &::before {
        content: "";
        position: absolute;
        inset: -4px -6px 0;
    }

    &:hover,
    &:focus-visible {
        filter: brightness(1.12);
        outline: none;
    }

    /* 툴팁. 값이 먼저 읽히고 날짜가 뒤따른다 */
    &:hover::after,
    &:focus-visible::after {
        content: attr(data-tip);
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 5;
        padding: 0.3rem 0.5rem;
        border-radius: 0.35rem;
        background-color: var(--foreground);
        color: var(--background);
        font-family: var(--font-body);
        font-size: 0.7rem;
        font-weight: 700;
        line-height: 1.4;
        white-space: nowrap;
        pointer-events: none;
    }
`;

/** 날짜 축. 막대와 같은 격자를 써야 눈금이 어긋나지 않는다 */
export const Axis = styled.div`
    margin-top: 0.4rem;
    display: grid;
    grid-template-columns: repeat(var(--bars), minmax(0, 1fr));
    gap: 2px;
    /* Plot 과 같은 상한이어야 눈금이 막대와 어긋나지 않는다 */
    max-width: calc(var(--bars) * 2.5rem);

    span {
        font-size: 0.65rem;
        color: var(--desccolor);
        text-align: center;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        /* 눈금을 전부 적으면 서로 겹친다. 표시할 것만 남기고 자리는 지킨다 */
        visibility: hidden;
    }
    span[data-show="true"] {
        visibility: visible;
    }
`;
