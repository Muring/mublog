import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";
import { bulletList } from "./Portfolio.styled";

const Item = styled.article`
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 2.5rem 0;
    scroll-margin-top: 5rem;

    ${mobile} {
        padding: 2rem 0;
    }
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;

    h3 {
        font-size: 1.7rem;
        font-weight: 900;
        line-height: 1.3;
        word-break: keep-all;
    }

    /* 저장소로 가는 아이콘. 흑백 svg 라 다크에서는 auto-dark 로 뒤집는다 */
    a {
        display: inline-flex;
        flex-shrink: 0;
        border-radius: 50%;
        transition: opacity 0.15s ease-in-out;
    }

    a:hover {
        opacity: 0.6;
    }
`;

/** 왼쪽에 기간·역할, 오른쪽에 설명. 좁아지면 위아래로 */
const Summary = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: 1.5rem 2.5rem;

    ${mobile} {
        grid-template-columns: minmax(0, 1fr);
        gap: 1rem;
    }
`;

const Facts = styled.dl`
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    font-size: 0.9rem;
    line-height: 1.5;

    dt {
        color: var(--desccolor);
        font-size: 0.75rem;
        font-weight: 700;
    }

    dd {
        font-weight: 700;
        word-break: keep-all;
    }
`;

const Description = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    .tagline {
        font-size: 1.05rem;
        font-weight: 800;
        word-break: keep-all;
    }

    p {
        line-height: 1.8;
        word-break: keep-all;
        overflow-wrap: break-word;
    }
`;

/** 왼쪽에 한 일, 오른쪽에 기술 스택 */
const Details = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 1.5rem 2.5rem;

    h4 {
        margin-bottom: 0.9rem;
        font-size: 1.1rem;
        font-weight: 800;
    }

    /* 같은 열에 두 번째로 오는 제목(Links)은 위 내용과 간격을 둔다 */
    h4 + * + h4 {
        margin-top: 1.5rem;
    }

    ul.did {
        ${bulletList}
    }

    ${mobile} {
        grid-template-columns: minmax(0, 1fr);
    }
`;

/** 외곽선 칩. 본문 링크 색을 빌려 "기술" 만 한 색으로 묶는다 */
const Stack = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;

    li {
        padding: 0.2rem 0.7rem;
        border: 1px solid var(--linkcolor);
        border-radius: 999px;
        color: var(--linkcolor);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.6;
        white-space: nowrap;
    }
`;

const Links = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;

    a {
        align-self: flex-start;
        color: var(--linkcolor);
        font-weight: 700;
        text-decoration-line: underline;
        text-underline-offset: 0.2em;
    }

    a:hover {
        color: var(--linkhovercolor);
    }
`;

export default { Item, Title, Summary, Facts, Description, Details, Stack, Links };
