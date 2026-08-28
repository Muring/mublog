"use client";

import styled from "@emotion/styled";

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

  tbody tr:hover {
    background-color: var(--hovercolor);
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
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--bordercolor);
  border-radius: 0.5rem;
  background-color: var(--cardbackground);
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover:not(:disabled) {
    background-color: var(--hovercolor);
    color: var(--hoverfontcolor);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
  &.primary {
    background-color: var(--activecolor);
    color: var(--activefontcolor);
    border-color: var(--activecolor);
  }
  &.danger {
    color: #d93025;
    border-color: #f0b4b0;
  }
`;
