"use client";

import styled from "@emotion/styled";
import { surface } from "@/styles/surface";
import { TableToolbar } from "./Admin.styled";

/**
 * 이 폭 이하에서는 옆 패널을 숨기고 상세를 아래에서 올라오는 시트로 띄운다.
 * CSS 와 JS(고르는 순간 시트를 열지)가 같은 값을 봐야 해서 한 곳에 둔다.
 * 컨테이너 쿼리가 아니라 뷰포트 기준인 이유: JS 의 matchMedia 는 뷰포트만 볼 수 있다.
 */
export const SHEET_MEDIA = "(max-width: 800px)";

/**
 * 이미지 관리 툴바 두 줄.
 *
 * filters-row: 쓰임 필터 · 정렬 · 초기화 · 일괄 삭제(오른쪽 끝)
 * search-row: 검색 · 글 필터 (반반)
 *
 * 한 줄에 다 넣으면 폭마다 어느 것이 다음 줄로 떨어질지가 달라져 배치가 들쭉날쭉했다.
 * 좁아지면(650px 이하, 포스트·댓글 툴바와 같은 기준) 쓰임 필터가 한 줄을 다 쓰고,
 * 그 아래 정렬·초기화·일괄 삭제가 폭을 나눠 가진다. 아랫줄은 두 칸이 각각 한 줄씩 쓴다.
 */
export const ImageToolbar = styled(TableToolbar)`
  .bulk-delete { margin-left: auto; }
  &.search-row input, &.search-row .post-filter { flex: 1 1 0; min-width: 160px; }
  &.search-row .post-filter > button { width: 100%; }

  @container admin (max-width: 650px) {
    /* 다섯 칸이 폭보다 넓어지면 줄바꿈 대신 트랙 안에서 옆으로 민다 — 칩이 두 줄로 갈라지면 선택 모양이 깨진다 */
    &.filters-row .status-filters {
      flex: 1 1 100%;
      overflow-x: auto;
      scrollbar-width: none;
    }
    &.filters-row .status-filters::-webkit-scrollbar { display: none; }
    /* 칸 여백을 줄여 375px 폰(내용 폭 343px)에서도 다섯 칸이 밀리지 않고 한 줄에 든다 */
    &.filters-row .status-filters button { flex: 1 0 auto; padding: 0 6px; }
    /*
     * 정렬·초기화는 제 폭을 지키고 일괄 삭제가 남는 폭을 가져간다.
     * 셋이 한 줄에 안 들어가면(아주 좁은 폭) 일괄 삭제가 다음 줄로 내려가 한 줄을 다 쓴다 —
     * 셋이 함께 줄어들면 정렬이 글자 한 자 폭으로 찌그러진다.
     */
    &.filters-row .sort-control, &.filters-row .reset { flex: 0 0 auto; }
    &.filters-row .bulk-delete { flex: 1 1 auto; margin-left: 0; }
    &.search-row input, &.search-row .post-filter { flex: 1 1 100%; }
  }
`;

/**
 * 이미지 관리: 왼쪽 그리드 + 오른쪽 상세 패널.
 * 좁아지면 그리드만 남는다. 폭은 전부 CSS 가 나눈다.
 */
export const ImagesLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 16px;
  align-items: start;

  > * { min-width: 0; }

  /* 카드 폭은 이미지 고르기 모달과 같게 둔다 */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
    gap: 0.75rem;
    padding: 2px;
  }

  @media ${SHEET_MEDIA} {
    grid-template-columns: minmax(0, 1fr);
    .inline-panel { display: none; }
  }
`;

export const DetailPanel = styled.aside`
  ${surface("12px")}
  position: sticky;
  top: 5rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  font-size: 13px;

  .placeholder {
    padding: 2rem 0;
    text-align: center;
    color: var(--desccolor);
  }

  .preview-button {
    display: block;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: none;
    cursor: zoom-in;
    outline: 1px solid transparent;
    transition: outline-color 150ms ease;
  }
  .preview-button:hover { outline-color: var(--linkhovercolor); }
  .preview-button:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }

  .preview {
    display: block;
    width: 100%;
    max-height: 14rem;
    object-fit: contain;
    border-radius: 8px;
    background-color: var(--codefontbgcolor);
  }

  dl {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 6px 12px;
    margin: 0;
  }
  dt { color: var(--desccolor); }
  dd { margin: 0; min-width: 0; }
  .path {
    font-family: "Consolas", monospace;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  h3 {
    font-size: 13px;
    font-weight: 800;
    margin: 0 0 6px;
  }

  /*
   * 상태 안내. 본문 callout(PostContent 의 aside)과 같은 모양 — 왼쪽 굵은 막대 + 옅은 테두리.
   * 손볼 거리(삭제 예정)만 막대·테두리를 상태색으로 바꾼다.
   */
  .state {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--calloutborder);
    border-left: 0.35rem solid var(--calloutaccent);
    border-radius: 8px;
    color: var(--foreground);
    line-height: 1.6;
  }
  .state .icon { flex-shrink: 0; font-weight: 700; }
  .state.scheduled {
    border-color: var(--warnborder);
    border-left-color: var(--warncolor);
    background-color: var(--warnbg);
    color: var(--warncolor);
  }

  .users {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .users a {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 6px;
    color: var(--foreground);
    text-decoration: none;
    transition: background-color 0.15s, color 0.15s;
  }
  /* 호버 면은 두 테마 모두 밝다. 자식 글자까지 함께 어두워져야 한다 */
  .users a:hover { background-color: var(--hovercolor); color: var(--hoverfontcolor); }
  .users a:hover .kind { color: var(--hoverdesccolor); }
  .users a:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
  .users .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .users .kind { flex-shrink: 0; font-size: 11px; color: var(--desccolor); }

  .badge {
    flex-shrink: 0;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    border: var(--border-width) solid var(--bordercolor);
    background-color: var(--codefontbgcolor);
    color: var(--foreground);
  }
  .badge.draft {
    border-color: var(--warnborder);
    background-color: var(--warnbg);
    color: var(--warncolor);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .actions > * { flex: 1 1 auto; justify-content: center; }
`;

/** 좁은 화면의 상세 시트. 뒤를 가리는 막 + 아래에 붙은 패널 */
export const SheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  /*
   * 확인 대화상자(z-index 200)보다 아래에 둔다. 시트 안의 삭제 버튼이 그걸 띄운다.
   * 이미지 뷰어는 네이티브 dialog 의 top layer 라 이 값과 상관없이 위에 뜬다.
   */
  z-index: 100;
  display: flex;
  align-items: flex-end;
  /* 이미지 고르기 막과 같은 값. 두 테마 모두 검정이어야 한다 */
  background-color: rgba(0, 0, 0, 0.4);
  /* 막을 끌어도 뒤 페이지가 움직이지 않는다. 시트 안은 아래 aside 가 세로 스크롤만 다시 허용한다 */
  touch-action: none;
  overscroll-behavior: contain;

  /* 막은 흐려졌다 짙어지고, 시트는 아래에서 올라온다. 닫을 때는 반대로 — 닫힘이 조금 더 빠르다 */
  animation: image-sheet-fade-in 240ms ease-out;
  > aside { animation: image-sheet-up 240ms cubic-bezier(0.2, 0.8, 0.2, 1); }
  &[data-closing] {
    pointer-events: none;
    animation: image-sheet-fade-out 200ms ease-in forwards;
  }
  &[data-closing] > aside { animation: image-sheet-down 200ms ease-in forwards; }

  @keyframes image-sheet-fade-in { from { opacity: 0; } }
  @keyframes image-sheet-fade-out { to { opacity: 0; } }
  @keyframes image-sheet-up { from { transform: translateY(100%); } }
  @keyframes image-sheet-down { to { transform: translateY(100%); } }

  /* 움직임 줄이기면 애니메이션 없이 바로 뜨고 바로 닫힌다(닫힘은 ImageDetailSheet 가 처리) */
  @media (prefers-reduced-motion: reduce) {
    &, > aside, &[data-closing], &[data-closing] > aside { animation: none; }
  }

  > aside {
    position: static;
    width: 100%;
    max-height: 85dvh;
    overflow-y: auto;
    /* 시트 끝까지 굴려도 뒤 페이지로 스크롤이 넘어가지 않는다 */
    overscroll-behavior: contain;
    touch-action: pan-y;
    border-bottom: 0;
    border-radius: 14px 14px 0 0;
    padding-bottom: max(14px, env(safe-area-inset-bottom));
  }

  .sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .sheet-head h2 { margin: 0; font-size: 14px; font-weight: 800; }
`;
