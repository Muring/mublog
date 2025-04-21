import styled from "@emotion/styled";

export const Article = styled.article`
    background-color: var(--background);
    color: var(--foreground);

    @media (prefers-color-scheme: dark) {
        background-color: var(--background);
        color: var(--foreground);
    }

    max-width: 720px;
    min-height: 85vh;
    margin: 0 auto;
    padding: 4rem 2rem;
    color: #1a1a1a;
    line-height: 2.5;
    animation: fadeIn 1s ease forwards;
    animation-fill-mode: forwards;

    /* 기본 텍스트 구조 */
    h1 {
        margin-bottom: 0.5rem;
    }

    h2 {
        margin: 2rem 0 1rem;
    }

    h3 {
        margin: 1rem 0;
    }

    p {
        margin-top: 1rem;
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

    p img {
        display: block;
        max-width: 656px;
        border: 1px solid var(--bordercolor);
        margin: 2rem auto 0 auto; /* 상-하 간격 조절 */
        border-radius: 6px;
    }

    /* 이미지 다음 p 요소 중, 이탤릭체인 것만 캡션으로 처리 */
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
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;

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
            gap: 0.5rem;
            margin: 0;
            padding-left: 1.5rem;
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

    /* 블록 요소 */
    blockquote {
        border-left: 0.5rem solid var(--bordercolor);
        padding: 0.2rem 0 0.2rem 1rem;
        background: var(--codefontbgcolor);
        font-style: italic;
        color: var(--foreground);
        margin: 1.5rem 0;
        border-radius: 0.5rem;

        p {
            margin: 0;
        }
    }

    code {
        background: var(--codefontbgcolor);
        padding: 0.1rem 0.3em;
        border-radius: 4px;
        font-size: 0.85rem;
        font-family: "Consolas";
        color: #ff7b00;
    }

    hr {
        border: none;
        border-top: 1px solid var(--bordercolor);
        margin: 2rem 0;
    }
`;
