"use client";

import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { surface } from "@/styles/surface";
import { SheetPanel } from "./AdminSheet.styled";
import { mobileQuery } from "@/styles/breakpoints";

/**
 * 이 폭 이하에서는 옆 패널을 숨기고 상세를 아래에서 올라오는 시트로 띄운다.
 * CSS 와 JS(고르는 순간 시트를 열지)가 같은 값을 봐야 해서 한 곳에 둔다.
 * 컨테이너 쿼리가 아니라 뷰포트 기준인 이유: JS 의 matchMedia 는 뷰포트만 볼 수 있다.
 */
export const SHEET_MEDIA = mobileQuery;

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
  .grid { transition: opacity 150ms ease; }
  &[aria-busy="true"] .grid { opacity: .45; pointer-events: none; }
  .load-more { display: grid; justify-items: center; gap: 8px; padding: 16px 0; }
  .load-more:empty { padding: 0; }
  .load-more p { color: var(--dangercolor); font-size: 13px; }
  @media (prefers-reduced-motion: reduce) { .grid { transition: none; } }

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

/** 상세 내용의 모양. 옆 패널과 좁은 화면의 시트가 함께 쓴다 */
export const detailContent = css`
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
  /* 제목과 보조 글자도 어두운 호버 면에서 읽히게 유지한다. */
  .users a:hover { background-color: var(--control-hover-bg); color: var(--foreground); }
  .users a:hover .kind { color: var(--foreground); }
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

export const DetailPanel = styled.aside`
  ${surface("12px")}
  position: sticky;
  top: 5rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  font-size: 13px;
  ${detailContent}
`;

/** 좁은 화면에서 상세를 담는 시트 본체. 공용 시트에 옆 패널과 같은 내용 모양을 더한다 */
export const ImageSheetPanel = styled(SheetPanel)`
  ${detailContent}
  .users a { min-height: 44px; box-sizing: border-box; }
`;
