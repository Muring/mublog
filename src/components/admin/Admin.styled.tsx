"use client";

import styled from "@emotion/styled";
import { buttonBase, buttonDanger, buttonPrimary } from "@/styles/button";

export const AdminWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  /* 헤더가 position: fixed / height 64px 이므로 그만큼 비워준다 */
  padding: 6rem 1rem 3rem;
  animation: fadeIn 1s ease forwards;

  .admin-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .stat {
    flex: 1 1 8rem;
    border: 1px solid var(--bordercolor);
    border-radius: 12px;
    background-color: var(--cardbackground);
    padding: 1rem;

    .label {
      font-size: 0.75rem;
      color: var(--desccolor);
    }
    .value {
      font-size: 1.5rem;
      font-weight: 800;
    }
  }
`;

export const PostTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    border-bottom: 1px solid var(--bordercolor);
    padding: 0.75rem 0.5rem;
    text-align: left;
    vertical-align: middle;
  }

  th {
    font-size: 0.75rem;
    color: var(--desccolor);
    font-weight: 700;
  }

  /*
    --hovercolor 는 다크 모드에서 #dadada 라 글자색(--foreground #cacaca)과
    거의 같아져 내용이 묻힌다. --hoverfontcolor 를 함께 쓰는 버튼과 달리
    행은 안쪽 글자색이 제각각이라 배경만 은은하게 바꾸는 편이 안전하다.
    --codefontbgcolor 는 라이트/다크 모두 배경보다 한 톤만 다른 값이다.
  */
  tbody tr:hover {
    background-color: var(--codefontbgcolor);
  }

  .title-cell {
    font-weight: 700;
  }

  .slug {
    display: block;
    font-size: 0.75rem;
    color: var(--desccolor);
    font-family: "Consolas", monospace;
  }

  .badge {
    display: inline-block;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    border: 1px solid var(--bordercolor);
  }
  .badge.published {
    background-color: var(--codefontbgcolor);
  }
  .badge.draft {
    color: #b26a00;
    border-color: #e3b341;
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  ${buttonBase}
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;

  &.primary {
    ${buttonPrimary}
  }
  &.danger {
    ${buttonDanger}
  }
`;
