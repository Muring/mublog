"use client";

import styled from "@emotion/styled";
import { buttonBase } from "@/styles/button";

export const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  /* 헤더(fixed, 64px)를 뺀 영역에서 세로 가운데 정렬 */
  min-height: calc(100vh - 64px);
  padding: 6rem 1rem 3rem;
  text-align: center;
  animation: fadeIn 1s ease forwards;
  animation-fill-mode: forwards;

  .desc {
    font-size: 0.9rem;
    color: var(--desccolor);
    line-height: 1.8;
  }

  .error {
    font-size: 0.85rem;
    color: var(--dangercolor);
  }

  /* 버튼 아래 안내. 결정에 필요한 정보지만 버튼보다 앞서 읽힐 필요는 없다 */
  .notice {
    max-width: 24rem;
    font-size: 0.78rem;
    line-height: 1.7;
    color: var(--desccolor);
    word-break: keep-all;

    a {
      color: var(--linkcolor);
      text-decoration: underline;
      white-space: nowrap;
    }
  }
`;

export const GithubButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  ${buttonBase}
  padding: 0.75rem 1.4rem;
  font-size: 0.95rem;
`;
