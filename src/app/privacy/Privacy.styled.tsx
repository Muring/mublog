"use client";

import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";

export const PrivacyWrapper = styled.main`
    max-width: 720px;
    margin: 0 auto;
    /* 헤더가 fixed / 64px 이므로 그만큼 비운다 */
    padding: 6rem 1.5rem 4rem;
    line-height: 1.9;

    ${mobile} {
        padding: 5rem 1rem 3rem;
    }

    h1 {
        font-size: 1.5rem;
        font-weight: 800;
    }

    .updated {
        margin-top: 0.35rem;
        font-size: 0.8rem;
        color: var(--desccolor);
    }

    .lead {
        margin-top: 1.5rem;
        font-size: 0.95rem;
        word-break: keep-all;
        overflow-wrap: break-word;
    }

    h2 {
        margin-top: 2.5rem;
        font-size: 1.05rem;
        font-weight: 800;
        padding-bottom: 0.4rem;
        border-bottom: 1px solid var(--bordercolor);
    }

    p,
    li {
        font-size: 0.9rem;
        word-break: keep-all;
        overflow-wrap: break-word;
    }

    p {
        margin-top: 0.85rem;
    }

    ul {
        margin-top: 0.85rem;
        padding-left: 1.1rem;
    }
    li {
        list-style: disc;
        margin-top: 0.35rem;
    }

    table {
        width: 100%;
        margin-top: 1rem;
        border-collapse: collapse;
        font-size: 0.85rem;
    }
    th,
    td {
        border: 1px solid var(--bordercolor);
        padding: 0.5rem 0.6rem;
        text-align: left;
        vertical-align: top;
        word-break: keep-all;
    }
    th {
        background-color: var(--codefontbgcolor);
        font-weight: 700;
        white-space: nowrap;
    }

    /* 표가 좁은 화면을 밀어내지 않게 자기 안에서 스크롤한다 */
    .table-scroll {
        overflow-x: auto;
    }

    code {
        background: var(--codefontbgcolor);
        color: var(--codefontcolor);
        padding: 0.1rem 0.3em;
        border-radius: 4px;
        font-family: "Consolas", monospace;
        font-size: 0.85em;
    }

    a {
        color: var(--linkcolor);
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
`;
