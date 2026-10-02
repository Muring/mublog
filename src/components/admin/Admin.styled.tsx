"use client";

import styled from "@emotion/styled";
import { statusBadgeBase } from "@/styles/status-badge";
import { buttonSubtle, buttonDanger, buttonPrimary, buttonGhost } from "@/styles/button";
import { thinScrollbar } from "@/styles/scrollbar";
import { surface } from "@/styles/surface";
import { listTableBase } from "@/styles/list-table";
import { truncate } from "@/styles/text";
import { mobile } from "@/styles/breakpoints";

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
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  ${mobile} {
    .admin-head a { display: inline-flex; align-items: center; min-height: 44px; box-sizing: border-box; }
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
  /* 누르면 넘어가는 카드(댓글). 모양은 같고 테두리만 반응한다 — buttonQuiet 의 호버와 같은 표현 */
  a.stat {
    display: block;
    color: inherit;
    text-decoration: none;
    outline: 1px solid transparent;
    outline-offset: calc(-1 * var(--border-width));
    transition: outline-color 150ms ease, border-color 150ms ease;
    &:hover {
      border-color: transparent;
      outline-color: var(--foreground);
    }
    /* 기본 링을 투명으로 덮었으니 키보드 초점은 따로 살린다 */
    &:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
  }

  /* 댓글 관리 머리의 보조 줄과 요약 */
  .admin-head .sub {
    margin-top: 0.3rem;
    font-size: 0.8rem;
    color: var(--desccolor);
    a {
      color: var(--linkcolor);
    }
  }
  .summary {
    font-size: 0.85rem;
    color: var(--desccolor);
    strong {
      color: var(--foreground);
    }
  }
  .summary + .empty {
    padding: 2.5rem 0;
    text-align: center;
    font-size: 0.85rem;
    color: var(--desccolor);
  }
`;

export const PostTable = styled.table`
  ${listTableBase}

  th:nth-of-type(2) { width: 5rem; }    /* 상태 */
  th:nth-of-type(3) { width: 9rem; }    /* 태그 */
  th:nth-of-type(4) { width: 7.5rem; }  /* 발행일 */
  th:nth-of-type(5) { width: 7.5rem; }  /* 수정일 */
  th:nth-of-type(6) { width: 5rem; }     /* 누적 조회 */
  th:nth-of-type(7) { width: 6rem; }    /* 댓글 */
  th:nth-of-type(9) { width: 7rem; }  /* 수정·삭제 */

  .views-total {
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  /* 날짜와 수는 한 덩어리다. 쪼개지느니 열을 넓힌다 */
  td:nth-of-type(4),
  td:nth-of-type(5),
  td:nth-of-type(6),
  td:nth-of-type(7),
  td:nth-of-type(8) {
    white-space: nowrap;
  }

  /*
   * 상태 배지와 댓글 수는 값이 짧아 열 안에서 떠 보인다. 헤더와 함께 가운데로 맞춘다.
   * 카드 모드에서는 td 가 flex 라 justify-content 가 자리를 정하므로 영향이 없다.
   */
  td:nth-of-type(2),
  td:nth-of-type(7),
  td:nth-of-type(8) {
    text-align: center;
  }

  .title-cell {
    font-weight: 700;
  }

  .title-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease, border-color 150ms ease;

    /*
     * 밑줄 대신 색이 바뀐다. 밑줄은 그어지는 순간 글자 아래 여백을 먹어
     * 두 줄짜리 제목에서 행이 미세하게 흔들린다.
     *
     * --linkhovercolor 는 행 호버면(--codefontbgcolor) 위에서 AA 를 넘긴다.
     * 행 배경이 함께 바뀌는 자리라 기본 배경만 보고 고르면 안 된다.
     */
    &:hover {
      color: var(--linkhovercolor);
    }

    /*
     * 키보드에는 색만으로 알리지 않는다. 색 변화는 초점이 어디 있는지를
     * 가리키기에 약하고, 색을 구분하지 못하면 아무 신호도 남지 않는다.
     */
    &:focus-visible {
      color: var(--linkhovercolor);
      outline: 2px solid var(--linkhovercolor);
      outline-offset: 2px;
      border-radius: 3px;
    }
  }

  .compact-tags, .compact-comments, .compact-likes { display: none; }

  .slug {
    display: block;
    font-size: 0.75rem;
    color: var(--desccolor);
    font-family: "Consolas", monospace;
    /* 긴 slug 가 제목 열을 밀어 다른 열을 굶기던 것을 막는다 */
    ${truncate}
  }

  .badge { ${statusBadgeBase} }

  .row-edit, .row-delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    height: 32px;
    padding: 0 9px;
    box-sizing: border-box;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--foreground);
    text-decoration: none;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color .15s, border-color 150ms ease;
  }
  .row-edit:hover { background: var(--control-hover-bg); color: var(--foreground); }
  .row-delete { color: var(--desccolor); }
  .row-delete:hover:not(:disabled) { background: var(--dangercolor); color: var(--dangerfontcolor); }
  .row-delete:disabled { opacity: .5; cursor: wait; }
  .row-edit:focus-visible, .row-delete:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
  .action-buttons {
    display: flex;
    gap: 0.4rem;
    white-space: nowrap;
  }

  /*
   * 좁아진다고 바로 카드로 바꾸지 않는다. 표는 여러 글을 한눈에 훑는 데 유리하므로
   * 먼저 덜 중요한 열부터 접어서 표 모양을 최대한 오래 유지한다.
   *
   * 접는 순서는 좋아요 -> 태그 -> 수정일 -> 조회 -> 댓글이다.
   * 태그와 댓글 링크는 열을 접어도 제목 아래에 남긴다.
   * 열을 더하거나 폭을 바꾸면 컨테이너 기준도 함께 조정한다.
   */
  th:nth-of-type(8) { width: 4.5rem; } /* 좋아요 */
  @container admin (max-width: 1050px) {
    th:nth-of-type(8), td:nth-of-type(8) { display: none; }
    .compact-likes { display: inline-block; margin: 6px 0 0 8px; font-size: 0.8rem; color: var(--desccolor); }
  }
  @container admin (max-width: 960px) {
    .compact-tags { display: block; font-size: 0.72rem; color: var(--desccolor); margin-top: 4px; }
    th:nth-of-type(3),
    td:nth-of-type(3) {
      display: none;
    }
  }

  @container admin (max-width: 900px) {
    th:nth-of-type(5),
    td:nth-of-type(5) {
      display: none;
    }
  }

  @container admin (max-width: 800px) {
    th:nth-of-type(6),
    td:nth-of-type(6) {
      display: none;
    }
  }

  @container admin (max-width: 720px) {
    .compact-comments { display: inline-block; font-size: 0.8rem; margin-top: 6px; color: var(--linkcolor); }
    th:nth-of-type(7),
    td:nth-of-type(7) {
      display: none;
    }
  }

  /*
   * 여기부터는 제목이 설 자리가 없다(상태 80 + 버튼 152 를 빼면 100px 남짓).
   * 열을 더 접느니 행을 카드로 바꾼다. 헤더를 감추고 각 셀이 data-label 로
   * 제 이름표를 달고 나온다.
   */
  ${mobile} {
    .compact-tags, .compact-comments, .compact-likes { display: none; }
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
    td:nth-of-type(5),
    td:nth-of-type(6),
    td:nth-of-type(7),
    td:nth-of-type(8) {
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

    &[data-loading] td[data-label]::before {
      content: "";
      width: 3em;
      height: .8em;
      border-radius: .4rem;
      background: var(--codefontbgcolor);
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

    .row-edit, .row-delete { min-width: 44px; height: 44px; }
    .title-link { display: inline-flex; align-items: center; min-width: 44px; min-height: 44px; }
    td:not(.title-cell) .title-link { justify-content: center; }

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
  ${buttonSubtle}
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;

  ${mobile} { min-width: 44px; min-height: 44px; box-sizing: border-box; }

  &.ghost { ${buttonGhost} }

  &.quiet-danger { background: transparent; border-color: transparent; color: var(--desccolor); outline: 1px solid transparent; outline-offset: calc(-1 * var(--border-width)); transition: outline-color 150ms ease, color 0.15s ease-in-out; }
  &.quiet-danger:hover:not(:disabled) { background-color: transparent; color: var(--dangercolor); outline-color: var(--bordercolor); }
  &.quiet-danger:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }

  &.primary {
    ${buttonPrimary}
    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--activecolor) 85%, var(--activefontcolor));
      color: var(--activefontcolor);
      border-color: var(--activecolor);
    }
    &:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
  }
  &.danger {
    ${buttonDanger}
  }
`;

/**
 * 포스트·댓글의 실제 목록과 로딩 목록이 함께 쓰는 스크롤 경계.
 *
 * 페이지 전체를 스크롤하면 통계와 차트가 위로 밀려 나가고, 목록 끝에서 다시
 * 올라와야 한다. 목록에 높이를 주고 그 안에서만 굴리면 화면 구성이 그대로 남는다.
 * 필터·개수 요약·페이지 이동은 밖에 두며, 카드 모드에서도 높이 제한을 유지한다.
 *
 * 높이는 뷰포트 기준이다. 픽셀로 고정하면 큰 화면에서 남는 자리를 못 쓰고
 * 작은 화면에서는 넘친다.
 */
export const AdminListScroll = styled.div`
  max-height: min(60vh, 40rem);
  overflow-y: auto;

  /* 스크롤 막대는 공용(styles/scrollbar). 표가 제 안에서 스크롤한다는 사실이 보여야 한다 */
  ${thinScrollbar()}
  /*
   * 스크롤바 자리를 늘 비워 둔다. 걸러진 행이 줄어 스크롤이 사라지면 표가
   * 스크롤바 폭만큼 넓어지는데, 그때 헤더와 열 경계가 한 번 튄다.
   */
  scrollbar-gutter: stable;
  overscroll-behavior: contain;

  /*
   * 비워 둔 스크롤바 자리는 표 밖이라 머리글 띠가 거기서 끊겨 잘린 것처럼 보였다.
   * 머리글이 있는 표일 때만 머리글 높이를 고정하고, 그 자리 맨 위에 같은 띠(위 1px·아래 2px 선)를 칠한다.
   * 스크롤 상자 배경은 내용과 함께 움직이지 않으므로 sticky 머리글과 늘 맞는다. 막대는 머리글 아래부터 움직인다.
   * 댓글 목록처럼 머리글이 없는 목록에는 걸리지 않는다.
   */
  --thead-h: 2.5rem;
  &:has(> table > thead) {
    background:
      linear-gradient(to bottom, var(--bordercolor) 0 var(--border-width), var(--codefontbgcolor) var(--border-width) calc(100% - 2px), var(--bordercolor) calc(100% - 2px)) right top / 10px var(--thead-h) no-repeat,
      var(--tablesurface);
  }
  &:has(> table > thead) thead th { height: var(--thead-h); box-sizing: border-box; padding-block: 0; white-space: nowrap; }
  &:has(> table > thead)::-webkit-scrollbar-track { margin-top: var(--thead-h); }
  /* 모바일 카드 배치에서는 머리글을 숨기므로 띠도 트랙 여백도 걷는다 */
  ${mobile} {
    &:has(> table > thead) { background: none; }
    &:has(> table > thead)::-webkit-scrollbar-track { margin-top: 0; }
  }

  .empty {
    padding: 2.5rem 0;
    text-align: center;
    font-size: 0.85rem;
    color: var(--desccolor);
  }
`;

/**
 * 결과 요약 줄: 왼쪽은 개수·용량 같은 요약, 오른쪽 끝은 결과 전체에 거는 일괄 동작(이미지의 "삭제 예정 지금 삭제").
 * 일괄 동작은 필터가 아니라 결과에 대한 것이라 필터 바에 두지 않는다.
 */
export const ResultBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin: 12px 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--desccolor);
  > p { margin: 0; min-width: 0; }
  .cleanup-note { display: block; font-size: 12px; margin-top: 2px; }
  > button { margin-left: auto; }
`;
