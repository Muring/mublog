"use client";

import styled from "@emotion/styled";

export const TagSelectorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    /* 부모(태그 field)가 남는 높이를 받으면 그대로 목록에 물려준다 */
    flex: 1;
    min-height: 0;

    /*
     * 태그가 늘어나면 이 목록만 계속 길어져 왼쪽 열이 오른쪽(썸네일)보다
     * 한참 커진다. 두 줄 남짓까지만 자리를 주고 그 뒤로는 안에서 스크롤한다.
     * 고르는 화면이라 다 보이는 것보다 다 닿을 수 있는 것이 중요하다.
     */
    .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        /*
         * 목록이 남는 높이를 받으므로 기본값(stretch)이면 칩이 세로로 늘어난다.
         * 칩은 제 높이를 지키고, 줄들은 위부터 쌓이게 한다.
         */
        align-items: flex-start;
        align-content: flex-start;
        /*
         * 자리가 있으면 채우고(flex), 모자라면 그 안에서 스크롤한다.
         * max-height 가 없으면 태그가 아주 많을 때 목록이 그대로 자라
         * 왼쪽 열이 오른쪽보다 한없이 길어진다 (207개에서 1275px 까지 갔다).
         * 평소에는 이 상한에 닿지 않아 두 열 높이가 정확히 맞는다.
         */
        flex: 1;
        min-height: 5.25rem;
        max-height: 12rem;
        overflow-y: auto;
        /* 스크롤이 생겼을 때 마지막 줄이 잘려 보이도록 아래를 살짝 띄운다 */
        padding-bottom: 0.15rem;
        overscroll-behavior: contain;
        scrollbar-width: thin;
    }

    .tag-list::-webkit-scrollbar {
        width: 6px;
    }
    .tag-list::-webkit-scrollbar-thumb {
        background-color: var(--bordercolor);
        border-radius: 999px;
    }

    /*
      다크 모드에서 --hovercolor 와 --activecolor 가 같은 값(#dadada)이라
      색만으로 구분하면 hover 가 선택처럼 보인다.
      선택은 '채움 + 체크', hover 는 '테두리 강조'로 축을 분리한다.
    */
    .tag-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.3rem 0.7rem;
        border: 1px solid var(--bordercolor);
        border-radius: 999px;
        background-color: var(--cardbackground);
        color: var(--foreground);
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: border-color 0.12s ease-in-out, background-color 0.12s ease-in-out;

        /* hover 는 배경을 건드리지 않고 테두리만 또렷하게 */
        &:hover {
            border-color: var(--foreground);
        }

        &.active {
            background-color: var(--foreground);
            color: var(--background);
            border-color: var(--foreground);
        }

        /* 선택된 칩에만 체크를 붙여 색과 무관하게 구분되도록 한다 */
        &.active::before {
            content: "✓";
            font-size: 0.7rem;
            line-height: 1;
        }

        &.add {
            border-style: dashed;
            color: var(--desccolor);
        }
    }

    .new-tag input {
        width: 7rem;
        padding: 0.3rem 0.6rem;
        border: 1px dashed var(--bordercolor);
        border-radius: 999px;
        background-color: var(--cardbackground);
        color: var(--foreground);
        font-family: inherit;
        font-size: 0.78rem;
    }

    /* 평소에는 투명하게 두되 높이는 유지해 레이아웃이 흔들리지 않게 한다 */
    .hint {
        min-height: 1rem;
        font-size: 0.7rem;
        font-weight: 500;
        color: transparent;
    }

    .hint.error {
        color: var(--dangercolor);
    }
`;
