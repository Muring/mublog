import styled from "@emotion/styled";

export const Article = styled.article`
    /* 기본 레이아웃 설정 */
    background-color: var(--background);
    color: var(--foreground);
    max-width: 720px;
    min-height: 85vh;
    margin: 0 auto;
    padding: 4rem 2rem;
    line-height: 2.5;
    animation: fadeIn 1s ease forwards;
    animation-fill-mode: forwards;

    /* 미디어 쿼리로 다크모드 대응 */
    @media (prefers-color-scheme: dark) {
        background-color: var(--background);
        color: var(--foreground);
    }

    /* 타이포그래피 기본 구조 */
    h1 {
        margin-bottom: 0.5rem;
    }
    h2 {
        margin-top: 2rem;
    }
    h3 {
        margin-top: 1.5rem;
    }
    p {
        margin-top: 0.5rem;
    }
    li {
        margin-left: 1rem;
        font-size: 0.95rem;
        list-style-type: circle;
    }
    a {
        color: #0070f3;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }

    /* 테이블 스타일 */
    table {
        width: 100%;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        border-collapse: collapse;
    }
    table td,
    table th {
        border: 1px solid var(--bordercolor);
    }
    table th {
        background-color: var(--codefontbgcolor);
    }
    table td {
        padding: 0 0.5rem;
    }

    /* 이미지 스타일 */
    p img {
        display: block;
        max-width: 656px;
        border: 1px solid var(--bordercolor);
        margin: 2rem auto 0 auto;
        border-radius: 6px;
    }

    /* 이미지 캡션 스타일 */
    p + em,
    p + p > em {
        display: block;
        text-align: center;
        font-size: 0.875rem;
        color: #888;
        margin-top: 0 !important;
        margin-bottom: 2rem;
    }

    /* 세부 정보 헤더 */
    .article-detail {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;

        .article-item {
            display: flex;
            align-items: center;
            min-width: 8rem;
            gap: 0.5rem;
        }
        .article-detail-icon {
            border-radius: 0;
            margin-right: 0.2rem;
        }
        .desc {
            padding-top: 0.1rem;
            font-size: 0.8rem;
            margin: 0;
        }
        .tag {
            font-size: 0.75rem;
            height: 100%;
            line-height: 2;
        }
        ul {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 0;
        }
        li {
            display: flex;
            align-items: center;
            color: black;
            margin: 0;
        }
        a {
            background-color: lightgray;
            border-radius: 12px;
            padding: 0 0.5rem;
            font-size: 0.8rem;
            color: #494949;
            font-weight: bold;
            &:hover {
                background-color: #afafaf;
                transition-duration: 0.2s;
                text-decoration: none;
            }
        }
    }

    /* Notion 스타일의 callout 블록 */
    aside {
        gap: 0.75rem;
        border-left: 0.5rem solid #ffd700;
        border-right: 1px solid var(--calloutborder);
        border-top: 1px solid var(--calloutborder);
        border-bottom: 1px solid var(--calloutborder);
        border-radius: 0.75rem;
        padding: 1rem;
        margin: 2rem 0;
        font-size: 0.95rem;
        line-height: 1.6;
        overflow-x: auto;
    }
    aside h3 {
        margin-bottom: 1rem;
    }
    aside blockquote {
        border-left: 0.3rem solid var(--foreground);
        border-radius: 0;
        font-style: normal;
        padding: 0.5rem;
    }
    aside > :first-of-type {
        font-size: 1.3rem;
        line-height: 1;
        margin-top: 0.2rem;
        position: relative;
    }

    /* 일반 blockquote */
    blockquote {
        border-left: 0.5rem solid var(--bordercolor);
        border-radius: 0.5rem;
        padding: 0.2rem 1rem;
        font-style: italic;
        color: var(--foreground);
        margin: 1.5rem 0;
        p {
            margin: 0;
        }
    }

    /* 인라인 코드 */
    code {
        background: var(--codefontbgcolor);
        padding: 0.1rem 0.3em;
        border-radius: 4px;
        font-size: 0.85rem;
        font-family: "Consolas";
        color: #ff7b00;
    }

    .code-highlight {
        padding: none !important;
    }

    /* 구분선 */
    hr {
        border: none;
        border-top: 1px solid var(--bordercolor);
        margin: 2rem 0;
    }
`;
