"use client";

import styled from "@emotion/styled";
import { buttonBase } from "@/styles/button";

/** 게임 고르기 창의 목록. 창 자체는 확인 대화상자(ConfirmOverlay·ConfirmBox)를 그대로 쓴다 */
export const GameList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    list-style: none;
    padding: 0;

    a {
        ${buttonBase}
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0.9rem;
        text-decoration: none;
    }

    .game-text {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;
        flex: 1;
    }

    .game-name {
        font-size: 0.9rem;
        font-weight: 800;
    }

    /* 호버 면이 두 테마 모두 밝은 회색이라 설명도 함께 어두워져야 한다 */
    .game-desc {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--desccolor);
        word-break: keep-all;
    }

    a:hover .game-desc {
        color: var(--hoverdesccolor);
    }

    html.dark & a:hover .auto-dark {
        filter: invert(0) brightness(1) !important;
    }

    .game-external {
        flex-shrink: 0;
        font-size: 0.85rem;
    }
`;
