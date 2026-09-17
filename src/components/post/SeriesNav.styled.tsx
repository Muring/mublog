"use client";

import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";

/* Article 과 같은 폭·여백 안에 놓인다. 본문 padding(1rem)에 맞춘다. */
export const SeriesBox = styled.nav`
  max-width: 900px;
  margin: 0 auto 2.5rem;
  padding: 0 1rem;

  .series-inner {
    border: var(--border-width) solid var(--bordercolor);
    border-radius: 0.5rem;
    padding: 1rem 1.25rem;
  }

  .series-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
  }
  .series-name {
    font-weight: 700;
    font-size: 0.95rem;
  }
  .series-count {
    font-size: 0.75rem;
    color: var(--desccolor);
    white-space: nowrap;
  }

  ol {
    margin: 0;
    padding: 0 0 0 1.4rem;
    font-size: 0.85rem;
    line-height: 1.5;
  }
  /* globals.css 가 li 의 마커를 지운다. 여기서는 번호가 곧 순서라 되살린다. */
  li {
    list-style-type: decimal;
  }
  li + li {
    margin-top: 0.3rem;
  }
  li::marker {
    color: var(--desccolor);
  }
  ol a {
    color: var(--desccolor);
    text-decoration: none;
    transition: color 0.15s, border-color 150ms ease;
  }
  ol a:hover {
    color: var(--linkhovercolor);
  }
  /* 현재 글. 굵기를 바꾸면 줄이 다시 접히므로 색으로만 표시한다. */
  ol a[aria-current="page"] {
    color: var(--foreground);
  }

  .series-adjacent {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.9rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bordercolor);
    font-size: 0.8rem;
  }
  .series-adjacent a {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
    max-width: 48%;
    color: var(--foreground);
    text-decoration: none;
  }
  .series-adjacent a:hover {
    color: var(--linkhovercolor);
  }
  .series-adjacent a.next {
    margin-left: auto;
    text-align: right;
  }
  .series-adjacent .dir {
    font-size: 0.7rem;
    color: var(--desccolor);
  }
  .series-adjacent .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${mobile} {
    .series-adjacent {
      flex-direction: column;
    }
    .series-adjacent a,
    .series-adjacent a.next {
      max-width: 100%;
      margin-left: 0;
      text-align: left;
    }
  }
`;
