import styled from "@emotion/styled";

export const Article = styled.article`
    background-color: var(--background);
    color: var(--foreground);

    @media (prefers-color-scheme: dark) {
        background-color: var(--background);
        color: var(--foreground);
    }

    max-width: 720px;
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
                background-color: #c5c5c5;
                transition-duration: 0.2s;
                text-decoration: none;
            }
        }
    }

    /* 블록 요소 */
    blockquote {
        border-left: 0.5rem solid #888888;
        padding: 0.2rem 0 0.2rem 1rem;
        background: #fdfdfd;
        font-style: italic;
        color: #424242;
        margin: 1.5rem 0;
        border-radius: 0.5rem;

        p {
            margin: 0;
        }
    }

    code {
        background: #f4f4f4;
        padding: 0.1rem 0.3em;
        border-radius: 4px;
        font-size: 0.85rem;
        font-family: "Consolas";
        color: #ff7b00;
    }

    hr {
        border: none;
        border-top: 1px solid #e9e9e9;
        margin: 2rem 0;
    }
`;
