"use client";

import styled from "@emotion/styled";

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
`;

export const GithubButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.4rem;
  border: 1px solid var(--bordercolor);
  border-radius: 0.5rem;
  background-color: var(--cardbackground);
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover:not(:disabled) {
    background-color: var(--hovercolor);
    color: var(--hoverfontcolor);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
