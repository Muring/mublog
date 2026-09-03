"use client";

import styled from "@emotion/styled";
import { buttonBase, buttonDanger, buttonPrimary } from "@/styles/button";
import { surface } from "@/styles/surface";
import { truncate } from "@/styles/text";

// 홈 헤더와 방문자 수도 같은 것을 쓰게 되어 ui/ 로 옮겼다. 기존 import 경로는 유지한다.
export { Skeleton } from "@/components/ui/Skeleton.styled";

export const AdminWrapper = styled.div`
  /*
   * 표가 뷰포트가 아니라 "자기가 실제로 받은 폭" 을 보고 판단하도록 기준을 만든다.
   * 뷰포트 기준이면 이 영역이 좁아진 다른 이유(사이드 패널 등)에는 반응하지 못한다.
   */
  container-type: inline-size;
  container-name: admin;

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
   * auto-fit 은 폭에 따라 3열 같은 어중간한 배치를 만든다.
   * 네 수치는 한 세트라 4열 아니면 2x2 둘 중 하나여야 한다.
   */
  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  @container admin (max-width: 620px) {
    .stat-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stat {
    ${surface("12px")}
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

  /*
   * auto 레이아웃은 내용이 긴 열(제목의 slug, 태그 목록)이 폭을 독차지하고
   * 나머지를 굶긴다. 그 결과 "발행" 배지가 "발/행" 으로, 버튼이 "수/정" 으로
   * 세로로 쪼개졌다. 각 열이 필요한 만큼을 미리 정해준다.
   */
  table-layout: fixed;

  /* 스크롤해도 열 이름이 남아야 어느 열인지 알 수 있다 */
  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--background);
  }

  th:nth-of-type(2) { width: 5rem; }    /* 상태 */
  th:nth-of-type(3) { width: 14rem; }   /* 태그 */
  th:nth-of-type(4) { width: 8rem; }    /* 발행일 */
  th:nth-of-type(5) { width: 4rem; }    /* 댓글 */
  th:nth-of-type(6) { width: 9.5rem; }  /* 수정·삭제 */

  /* 날짜와 버튼은 한 덩어리다. 쪼개지느니 열을 넓힌다 */
  td:nth-of-type(4),
  td:nth-of-type(5) {
    white-space: nowrap;
  }

  /*
   * 상태 배지와 댓글 수는 값이 짧아 열 안에서 떠 보인다. 헤더와 함께 가운데로 맞춘다.
   * 카드 모드에서는 td 가 flex 라 justify-content 가 자리를 정하므로 영향이 없다.
   */
  td:nth-of-type(2),
  td:nth-of-type(5) {
    text-align: center;
  }

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
    text-align: center;
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

  .title-link {
    color: inherit;
    text-decoration: none;

    &:hover,
    &:focus-visible {
      text-decoration: underline;
    }
  }

  .slug {
    display: block;
    font-size: 0.75rem;
    color: var(--desccolor);
    font-family: "Consolas", monospace;
    /* 긴 slug 가 제목 열을 밀어 다른 열을 굶기던 것을 막는다 */
    ${truncate}
  }

  .badge {
    display: inline-block;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    /* 글자가 두 자뿐이라 쪼개지면 배지로 보이지 않는다 */
    white-space: nowrap;
    border: 1px solid var(--bordercolor);
  }

  /*
   * 두 상태가 한눈에 갈려야 한다.
   * 회색으로 조용히 두었더니 배경(--codefontbgcolor)과 글자(--desccolor)가
   * 둘 다 무채색이라 "상태" 가 아니라 그냥 흐린 글씨로 보였다.
   * 켜져 있음은 초록, 아직임은 앰버로 색을 갈라 놓는다.
   */
  .badge.published {
    background-color: var(--okbg);
    color: var(--okcolor);
    border-color: var(--okborder);
  }

  /*
   * 초안은 "아직 안 보이는 글" 이라 눈에 걸려야 한다.
   * 예전에는 #b26a00 을 하드코딩해 다크 3.51 / 라이트 4.24 로 양쪽 다 미달이었고
   * 테마도 따르지 않았다. 토큰으로 바꿔 라이트 6.44 / 다크 8.91 을 만든다.
   */
  .badge.draft {
    background-color: var(--warnbg);
    color: var(--warncolor);
    border-color: var(--warnborder);
  }

  .action-buttons {
    display: flex;
    gap: 0.4rem;
    white-space: nowrap;
  }

  /*
   * 좁아진다고 바로 카드로 바꾸지 않는다. 표는 여러 글을 한눈에 훑는 데 유리하므로
   * 먼저 덜 중요한 열부터 접어서 표 모양을 최대한 오래 유지한다.
   * 접는 순서는 태그 -> 댓글 이고, 둘 다 수정 화면에서 다시 볼 수 있는 정보다.
   */
  @container admin (max-width: 900px) {
    th:nth-of-type(3),
    td:nth-of-type(3) {
      display: none;
    }
  }

  @container admin (max-width: 720px) {
    th:nth-of-type(5),
    td:nth-of-type(5) {
      display: none;
    }
  }

  /*
   * 여기부터는 제목이 설 자리가 없다(상태 80 + 버튼 152 를 빼면 100px 남짓).
   * 열을 더 접느니 행을 카드로 바꾼다. 헤더를 감추고 각 셀이 data-label 로
   * 제 이름표를 달고 나온다.
   */
  @container admin (max-width: 560px) {
    display: block;
    table-layout: auto;

    thead {
      display: none;
    }

    tbody,
    tr,
    td {
      display: block;
    }

    /* 접었던 열을 카드에서는 다시 보여준다. 세로로는 자리가 있다 */
    td:nth-of-type(3),
    td:nth-of-type(5) {
      display: flex;
    }

    tr {
      ${surface("12px")}
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
      white-space: normal;
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

/**
 * 표만 스크롤한다.
 *
 * 페이지 전체를 스크롤하면 통계와 차트가 위로 밀려 나가고, 목록 끝에서 다시
 * 올라와야 한다. 표에 높이를 주고 그 안에서만 굴리면 화면 구성이 그대로 남는다.
 *
 * 높이는 뷰포트 기준이다. 픽셀로 고정하면 큰 화면에서 남는 자리를 못 쓰고
 * 작은 화면에서는 넘친다.
 */
export const TableScroll = styled.div`
  max-height: min(60vh, 40rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  border-top: 1px solid var(--bordercolor);

  .empty {
    padding: 2.5rem 0;
    text-align: center;
    font-size: 0.85rem;
    color: var(--desccolor);
  }

  /* 좁은 화면에서는 행이 카드로 바뀌어 세로로 길어지므로 높이를 풀어준다 */
  @container admin (max-width: 560px) {
    max-height: none;
    overflow-y: visible;
  }
`;

/** 검색 줄. 표 바로 위에 두어 무엇을 거르는지 분명히 한다 */
export const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;

  input {
    flex: 1;
    min-width: 0;
    padding: 0.45rem 0.65rem;
    ${surface("0.5rem")}
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.85rem;

    &:focus {
      outline: 2px solid var(--bordercolor);
      outline-offset: 1px;
    }
  }

  .count {
    flex-shrink: 0;
    font-size: 0.78rem;
    color: var(--desccolor);
    font-variant-numeric: tabular-nums;
  }
`;
