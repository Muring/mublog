"use client";

import styled from "@emotion/styled";

export const TagSelectorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
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
        color: #d93025;
    }
`;
