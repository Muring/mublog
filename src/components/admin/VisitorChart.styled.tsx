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

    /* 그림 자리를 그대로 차지해, 단위를 오갈 때 카드 높이가 튀지 않는다 */
    .empty {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 186px;
        text-align: center;
        font-size: 0.85rem;
        line-height: 1.8;
        color: var(--desccolor);

        strong {
            color: var(--foreground);
            font-size: 0.95rem;
            font-variant-numeric: tabular-nums;
        }
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
 * 그림 영역.
 *
 * 꺾은선을 쓴다. 막대로 그리면 Daily(30개)와 Monthly(12개)의 두께가 크게 달라지는데,
 * 폭에 상한을 두면 남는 자리가 단위마다 달라져 간격이 어긋나고, 상한을 없애면
 * Monthly 가 슬래브처럼 두꺼워진다. 선은 점 개수와 무관하게 같은 굵기라
 * 세 단위가 같은 그림으로 보인다. 애초에 시간 추이는 선이 맞는 형태다.
 *
 * 폭 계산은 CSS 와 SVG 의 viewBox 에 맡긴다. 점 개수만 --pts 로 넘긴다.
 */
export const Plot = styled.div`
    --axis-w: 2rem;
    position: relative;
    height: 172px;
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

    /*
     * 선·점·툴팁이 함께 놓이는 상자. 축 자리만큼 왼쪽을 비운다.
     *
     * 단위를 바꿀 때만 왼쪽에서 오른쪽으로 드러난다. 카드를 여는 동안에는
     * ::details-content 가 상자 높이를 늘리는 중이라, 그림이 동시에 움직이면
     * 두 전환이 겹쳐 흔들려 보인다.
     */
    .series {
        position: absolute;
        left: var(--axis-w);
        right: 0;
        top: 1.1rem;
        bottom: 0;
    }
    [data-animate="true"] & .series {
        animation: series-reveal 0.45s ease-out;
    }

    @keyframes series-reveal {
        from {
            clip-path: inset(0 100% 0 0);
        }
        to {
            clip-path: inset(0 0 0 0);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        [data-animate="true"] & .series {
            animation: none;
        }
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

/**
 * 값 하나에 대응하는 세로 띠.
 *
 * 선 위의 점은 지름 8px 라 그대로는 조준할 수 없다. 그래서 점이 아니라
 * 위아래로 꽉 찬 띠가 히트 영역이 된다 — 커서를 세로로 맞출 필요가 없다.
 * 클릭 대상이 아니라 button 이 아니지만, 키보드로도 값에 닿아야 하므로
 * tabIndex 를 주고 focus-visible 에서도 툴팁이 뜬다.
 */
export const Hit = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--x);
    width: var(--w);
    transform: translateX(-50%);
    cursor: default;

    &:focus-visible {
        outline: none;
    }

    /* 꼭짓점. 평소에는 숨고 가리킬 때만 뜬다 — 30개를 늘 찍으면 선이 안 보인다 */
    .dot {
        position: absolute;
        top: var(--y);
        left: 50%;
        width: 8px;
        height: 8px;
        margin: -4px 0 0 -4px;
        border-radius: 50%;
        background-color: var(--chartbar);
        /* 선과 겹치는 자리라 배경색 링으로 한 겹 띄운다 */
        border: 2px solid var(--cardbackground);
        opacity: 0;
        pointer-events: none;
    }
    &:hover .dot,
    &:focus-visible .dot,
    &[data-peak="true"] .dot {
        opacity: 1;
    }

    /* 최댓값만 숫자를 적는다. 서른 개에 다 적으면 아무도 읽지 않는다 */
    .peak-value {
        position: absolute;
        top: var(--y);
        left: 50%;
        transform: translate(-50%, calc(-100% - 0.7rem));
        font-size: 0.68rem;
        font-weight: 800;
        line-height: 1;
        color: var(--foreground);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        pointer-events: none;
    }

    /* 툴팁. 값이 먼저 읽히고 날짜가 뒤따른다 */
    &:hover::after,
    &:focus-visible::after {
        content: attr(data-tip);
        position: absolute;
        top: var(--y);
        left: 50%;
        transform: translate(-50%, calc(-100% - 0.85rem));
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

/**
 * 날짜 축.
 *
 * 눈금은 선의 꼭짓점 바로 아래 와야 한다. 점은 i/(n-1) 자리에 있으므로
 * 격자로 나누지 않고 같은 식으로 절대 배치한다. 양 끝은 반쯤 잘리지 않도록
 * 가운데 정렬을 풀어 안쪽으로 붙인다.
 */
export const Axis = styled.div`
    position: relative;
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
