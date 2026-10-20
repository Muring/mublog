"use client";

import styled from "@emotion/styled";

/**
 * 본문 목차 자리. Article 안, 구분선과 본문 사이에 놓이고 폭·여백은 Article 이 잡는다.
 * 넓은 화면(1400px+)에서는 본문 오른쪽에 고정 패널로 띄운다 — 접기 대신 제목·맨 위로를 보이고, 목차 자체가 스크롤한다.
 * 목차 쪽 규칙(루트 + 클래스)을 이기도록 [data-toc] 안의 속성으로 한 단계 높여 고른다.
 */
export const PostNavigationDock = styled.div`
    margin: 0 0 2rem;

    @media (min-width: 1400px) {
        position: fixed;
        top: 112px;
        left: calc(50% + 470px);
        width: 210px;
        margin: 0;
        z-index: 10;

        [data-toc] {
            max-height: calc(100dvh - 144px);
            overflow-y: auto;
            overscroll-behavior: contain;
        }
        [data-toc] [data-toc-title],
        [data-toc] [data-toc-body],
        [data-toc] [data-toc-top] {
            display: block;
        }
        [data-toc] [data-toc-toggle] {
            display: none;
        }
        [data-toc] [data-toc-body] {
            margin-top: 0;
        }
    }
`;
