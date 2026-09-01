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

  /*
   * flex + flex-wrap 이면 좁아질 때 한 줄에 하나씩 떨어져 세로로 길어진다.
   * 최소 폭만 정해두면 4 -> 2 -> 1 개로 알아서 접힌다.
   */
  .stat-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .stat {
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

  .action-buttons {
    display: flex;
    gap: 0.4rem;
  }

  /*
   * 좁은 화면에서는 6열을 가로로 유지할 방법이 없다.
   * 가로 스크롤은 목록을 훑는 동작과 맞지 않으므로 행을 카드로 바꾼다.
   * 헤더를 감추는 대신 각 셀이 data-label 로 제 이름을 달고 나온다.
   */
  @media (max-width: 860px) {
    display: block;

    thead {
      display: none;
    }

    tbody,
    tr,
    td {
      display: block;
    }

    tr {
      border: 1px solid var(--bordercolor);
      border-radius: 12px;
      background-color: var(--cardbackground);
      padding: 0.875rem 1rem;
      margin-bottom: 0.75rem;
    }

    td {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-bottom: none;
      padding: 0.3rem 0;
      text-align: right;
    }

    td::before {
      content: attr(data-label);
      flex-shrink: 0;
      color: var(--desccolor);
      font-size: 0.75rem;
      font-weight: 700;
      text-align: left;
    }

    /* 이 둘은 이름표가 필요 없다. attr() 이 빈 값이면 빈 상자가 남는다 */
    .title-cell::before,
    .actions::before {
      content: none;
    }

    /* 제목은 이름표 없이 한 줄을 통째로 쓴다 */
    .title-cell {
      display: block;
      text-align: left;
      padding: 0 0 0.5rem;
      border-bottom: 1px solid var(--bordercolor);
      margin-bottom: 0.4rem;
      font-size: 0.95rem;
      word-break: keep-all;
      overflow-wrap: break-word;
    }

    .actions {
      justify-content: flex-end;
      padding-top: 0.75rem;
    }

    /* 카드가 곧 행이라 배경을 또 바꾸면 어수선하다 */
    tbody tr:hover {
      background-color: var(--cardbackground);
      border-color: var(--desccolor);
    }
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
