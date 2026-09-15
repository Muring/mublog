import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";

export const HeroWrapper = styled.section`
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding-top: 1rem;

    h1 {
        font-size: 3.2rem;
        font-weight: 900;
        line-height: 1.3;
        word-break: keep-all;
    }

    /* 이름. 블로그의 따뜻한 강조색(인라인 코드 색)을 빌린다 */
    h1 em {
        font-style: normal;
        color: var(--codefontcolor);
    }

    ${mobile} {
        h1 {
            font-size: 2.2rem;
        }
    }
`;

export const Value = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    h4 {
        font-size: 1.3rem;
        font-weight: 800;
        line-height: 1.6;
    }

    /* 형광펜. 콜아웃 테두리 토큰이 양 테마에 노란색 한 벌씩 있어 그대로 쓴다 */
    mark {
        padding: 0 0.2em;
        border-radius: 0.2em;
        background-color: var(--calloutborder);
        color: inherit;
    }

    p {
        font-size: 1.15rem;
        line-height: 1.9;
        word-break: keep-all;
        overflow-wrap: break-word;
    }
`;
