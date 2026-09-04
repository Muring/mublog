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
export const ChartCard = styled.details`
    ${surface("12px")}
    padding: 0.85rem 1.25rem;
    margin-bottom: 1.5rem;
    container-type: inline-size;

    /*
     * 접힌 상태에서도 요약은 보인다. 늘 확인하는 값이 아니라 접어두지만,
     * 굳이 펼치지 않아도 오늘과 최근 합계는 알 수 있어야 한다.
     */
    summary {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem 0.75rem;
        cursor: pointer;
        list-style: none;

        &::-webkit-details-marker {
            display: none;
        }
        &:focus-visible {
            outline: 2px solid var(--bordercolor);
            outline-offset: 3px;
            border-radius: 4px;
        }
    }

    .title {
        font-size: 0.9rem;
        font-weight: 800;
        color: var(--foreground);

        /* 접힘/펼침을 알리는 삼각형. 기본 마커는 브라우저마다 달라 직접 그린다 */
        &::before {
            content: "▸";
            display: inline-block;
            margin-right: 0.4rem;
            color: var(--desccolor);
            transition: transform 0.15s ease;
        }
    }
    &[open] .title::before {
        transform: rotate(90deg);
    }

    .summary-value {
        font-size: 0.8rem;
        color: var(--desccolor);
        font-variant-numeric: tabular-nums;

        strong {
            color: var(--foreground);
            font-weight: 800;
        }
    }

    /*
     * 열고 닫을 때 높이가 전환된다.
     *
     * details 의 내용은 ::details-content 라는 한 상자로 묶여 있어서, 여기에
     * transition 을 걸면 열림과 닫힘이 **둘 다** 움직인다. [open] 에 keyframe 을
     * 거는 흔한 방법은 열릴 때만 움직이고 닫힐 때는 뚝 끊긴다.
     *
     * content-visibility 는 값이 띄엄띄엄한(discrete) 속성이라 그냥은 전환되지
     * 않는다. allow-discrete 를 줘야 닫히는 동안 내용이 남아 같이 접힌다.
     */
    &::details-content {
        block-size: 0;
        overflow: hidden;
        transition:
            block-size 0.25s ease,
            content-visibility 0.25s allow-discrete;
    }
    &[open]::details-content {
        block-size: auto;
    }

    @media (prefers-reduced-motion: reduce) {
        &::details-content {
            transition: none;
        }
    }

    .body {
        margin-top: 1rem;
    }

    /* 집계 단위와 연도를 한 줄에 둔다 */
    .controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .empty {
        padding: 2rem 0;
        text-align: center;
        font-size: 0.85rem;
        color: var(--desccolor);
    }
`;

/** 기간 선택. 차트 위 한 줄에 둔다 */
export const RangeTabs = styled.div`
    display: flex;
    gap: 0.25rem;

    button {
        padding: 0.25rem 0.6rem;
        border: 1px solid transparent;
        border-radius: 999px;
        background: none;
        color: var(--desccolor);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;

        &:hover {
            color: var(--foreground);
        }

        &.active {
            background-color: var(--activecolor);
            color: var(--activefontcolor);
        }
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
    /* 최댓값 눈금 글자가 위 기간 탭에 붙지 않도록 자리를 준다 */
    margin-top: 1.1rem;
    /* 눈금선이 축 글자 위로 넘치지 않도록 그림 영역과 축을 나눈다 */
    height: 168px;
    display: grid;
    grid-template-columns: repeat(var(--bars), minmax(0, 1fr));
    align-items: end;
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

    /*
     * 단위를 바꾸면 막대의 key 가 달라져 다시 마운트되므로 이 애니메이션이
     * 새로 돈다. --i 로 조금씩 늦춰 왼쪽에서 오른쪽으로 차오른다.
     *
     * fill-mode 를 주지 않는다. 끝난 뒤 transform 이 none 으로 돌아가야
     * 쌓임 맥락이 남지 않고, 호버 툴팁이 뒤 막대에 가리지 않는다.
     */
    transform-origin: bottom;
    animation: bar-grow 0.32s ease-out;
    animation-delay: calc(var(--i, 0) * 12ms);

    @keyframes bar-grow {
        from {
            transform: scaleY(0);
        }
        to {
            transform: scaleY(1);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }

    &[data-zero="true"] {
        background-color: var(--bordercolor);
    }

    /*
     * 기록이 없는 달. 0 과 다르다 — "아무도 안 왔다" 가 아니라 "세지 않았다" 다.
     * 막대를 그리지 않고 바닥에 점선만 남겨 자리는 지키되 값이 있는 척하지 않는다.
     */
    &[data-empty="true"] {
        background-color: transparent;
        border-bottom: 1px dashed var(--bordercolor);
        border-radius: 0;
    }

    /* 히트 영역을 막대보다 넓게 잡는다. 2px 막대는 조준할 수 없다 */
    &::before {
        content: "";
        position: absolute;
        inset: -4px -6px 0;
    }

    /*
     * z-index 를 함께 올린다. filter 는 새 쌓임 맥락을 만들기 때문에,
     * 이것만 걸면 툴팁의 z-index 가 그 안에 갇혀 뒤에 오는 막대에 가린다.
     * (DOM 순서상 뒤 형제가 위에 그려진다)
     */
    &:hover,
    &:focus-visible {
        z-index: 6;
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

/** 연도 선택. Monthly 에서만 뜬다 */
export const YearSelect = styled.select`
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--bordercolor);
    border-radius: 0.4rem;
    background-color: var(--cardbackground);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid var(--bordercolor);
        outline-offset: 1px;
    }
`;
