"use client";

import styled from "@emotion/styled";

export const Article = styled.article`
    max-width: 720px;
    margin: 0 auto;
    padding: 4rem 2rem;
    font-family: "Noto Sans KR", "Pretendard", sans-serif;
    line-height: 2;
    color: #1a1a1a;

    .desc {
        color: gray;
    }

    .article-detail {
        display: flex;
        align-items: center;
        margin-bottom: 2.5rem;
        gap: 0.5rem;
        height: 2rem;

        .article-detail-icon {
            border-radius: 0;
            margin-right: 0.2rem;
        }

        p {
            font-size: 0.9rem;
            margin: 0;
        }

        ul {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5rem;
            margin: 0;
        }

        li {
            display: flex;
            align-items: center;
            color: black;
            list-style-type: none;
            margin: 0;
        }

        a {
            background-color: lightgray;
            border-radius: 8px;
            padding: 0 0.4rem;
            font-size: 0.8rem;
            color: #5e5e5e !important;
            text-decoration: none;
            font-weight: bold;

            &:hover {
                text-decoration: none !important;
                background-color: #c5c5c5 !important;
                transition-duration: 0.2s;
            }
        }
    }

    h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .description {
        font-size: 1.125rem;
        color: #666;
        margin-bottom: 2rem;
    }

    h2 {
        font-size: 1.75rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.4rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    p {
        font-size: 0.95rem;
        margin-bottom: 1rem;
    }

    ul,
    ol {
        padding-left: 1.5rem;
        margin-bottom: 1.25rem;
        font-size: 0.95rem;
    }

    li {
        margin-bottom: 0.5rem;
    }

    blockquote {
        border-left: 4px solid #888888;
        padding: 0.2rem 0 0.2rem 1rem;
        background: #fdfdfd;
        font-style: italic;
        color: #424242;
        margin: 1.5rem 0;

        p {
            margin: 0;
        }
    }

    /* pre {
        background: #f4f4f4;
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 1rem;
        margin: 1.5rem 0;
    } */

    code {
        background: #f4f4f4;
        padding: 0.1rem 0.3em;
        border-radius: 4px;
        font-size: 0.85rem;
        font-family: "Consolas";
        color: #ff7b00;
    }

    img {
        max-width: 100%;
        margin: 2rem 0;
        border-radius: 6px;
    }

    a {
        color: #0070f3;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    hr {
        border: none;
        border-top: 1px solid #e2e2e2; /* 원하는 색상으로 변경 */
        margin: 2rem 0;
    }
`;
