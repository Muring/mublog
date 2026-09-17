import { css } from "@emotion/react";

/**
 * 상호배타 선택 두 가지 모양.
 *
 * segmented — 회색 트랙 위에 고른 항목만 흰 칩으로 떠오른다. 표 툴바(포스트·댓글 목록의 상태 필터).
 *   높이 38px 은 TableToolbar 의 입력창·드롭다운·버튼과 같다.
 * pills — 알약 트랙 안에 작은 알약이 서고 고른 것만 --activecolor 로 채운다. 통계 카드(종류·집계 단위).
 *   트랙이 있는 건 segmented 와 같고, 모서리와 채우는 색만 다르다.
 *
 * 둘 다 고른 항목은 aria-pressed(토글 묶음) 또는 aria-selected(탭) 로 표시한다.
 * 같은 화면 안에서는 한 가지만 쓴다 — 표 툴바끼리, 통계 카드 안끼리 갈리면 안 된다.
 */
export const segmented = css`
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    height: 38px;
    box-sizing: border-box;
    background: var(--codefontbgcolor);
    border-radius: 8px;

    button {
        height: 32px;
        border: 0;
        border-radius: 6px;
        padding: 0 10px;
        font: inherit;
        font-size: 12px;
        white-space: nowrap;
        background: transparent;
        color: var(--desccolor);
        cursor: pointer;
        transition: background-color 0.15s, color 0.15s;
    }
    button[aria-pressed="true"],
    button[aria-selected="true"] {
        background: var(--background);
        color: var(--foreground);
        font-weight: 700;
        box-shadow: 0 1px 3px #0002;
    }
    button:hover {
        color: var(--foreground);
        background: color-mix(in srgb, var(--foreground) 8%, var(--background));
    }
    button[aria-pressed="true"]:hover,
    button[aria-selected="true"]:hover {
        background: var(--background);
    }
    button:focus-visible {
        outline: 2px solid var(--linkhovercolor);
        outline-offset: 2px;
    }
`;

export const pills = css`
    display: inline-flex;
    align-items: center;
    gap: 2px;
    /* 트랙도 알약이다. 표 툴바의 세그먼트처럼 하나로 묶여 보이되 모서리만 둥글다 */
    padding: 3px;
    background: var(--codefontbgcolor);
    border-radius: 999px;

    button {
        padding: 0.3rem 0.7rem;
        border: 0;
        border-radius: 999px;
        background: none;
        color: var(--desccolor);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        transition: background-color 0.15s, color 0.15s;

        &:hover {
            color: var(--foreground);
        }
        &[aria-pressed="true"],
        &[aria-selected="true"] {
            background-color: var(--activecolor);
            color: var(--activefontcolor);
            &:hover {
                background-color: color-mix(in srgb, var(--activecolor) 85%, var(--activefontcolor));
            }
        }
        &:focus-visible {
            outline: 2px solid var(--linkhovercolor);
            outline-offset: 2px;
        }
    }
`;
