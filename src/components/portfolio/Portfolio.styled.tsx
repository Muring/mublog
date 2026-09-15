import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { mobile } from "@/styles/breakpoints";

/**
 * 포트폴리오 페이지의 조각.
 *
 * 카드로 감싸지 않고 문서처럼 흘러가는 구성이다 — 큰 제목, 구분선, 2열 격자.
 * 색·폰트는 전부 블로그 토큰이고, 폭은 포스트 본문(PostContent 900px)과 같은 눈금에 둔다.
 */
export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5rem;
    width: 100%;
    max-width: 900px;
    padding: 1rem 1rem 5rem;
    animation: fadeIn 0.6s ease forwards;

    ${mobile} {
        gap: 3.5rem;
    }
`;

export const Section = styled.section`
    display: flex;
    flex-direction: column;
    /* 상단 고정 헤더에 가리지 않게 앵커 이동 시 위를 띄운다 */
    scroll-margin-top: 5rem;

    > h2 {
        margin-bottom: 2rem;
        font-size: 2.2rem;
        font-weight: 900;
        line-height: 1.2;
    }

    > .intro {
        margin: -1rem 0 2rem;
        color: var(--desccolor);
        font-size: 1.05rem;
        line-height: 1.8;
        word-break: keep-all;
    }

    ${mobile} {
        > h2 {
            font-size: 1.8rem;
        }
    }
`;

/**
 * 글머리표 목록. 전역에서 list-style 을 지워 두어 직접 그린다.
 * 본문 안 어디서든 같은 점 · 같은 간격이 나오게 한 곳에 둔다.
 */
export const bulletList = css`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-left: 1.1rem;

    li {
        position: relative;
        font-size: 1.05rem;
        line-height: 1.75;
        word-break: keep-all;
        overflow-wrap: break-word;
    }

    li::before {
        content: "";
        position: absolute;
        left: -1rem;
        top: 0.72em;
        width: 0.3rem;
        height: 0.3rem;
        border-radius: 50%;
        background-color: var(--foreground);
    }
`;

/** 항목(프로젝트 · 기술 분류) 사이의 얇은 선 */
export const Divided = styled.div`
    display: flex;
    flex-direction: column;

    > * + * {
        border-top: 1px solid var(--bordercolor);
    }
`;

export const SkillGroup = styled.article`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem 0;

    h3 {
        font-size: 1.5rem;
        font-weight: 900;
    }

    ul {
        ${bulletList}
    }
`;

export const ContactList = styled.dl`
    display: grid;
    grid-template-columns: 6rem minmax(0, 1fr);
    gap: 0.9rem 1rem;
    align-items: center;

    dt {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.05rem;
        font-weight: 800;
    }

    dd {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    a {
        color: var(--linkcolor);
        font-size: 1.05rem;
        font-weight: 700;
        text-decoration-line: underline;
        text-underline-offset: 0.2em;
    }

    a:hover {
        color: var(--linkhovercolor);
    }
`;
