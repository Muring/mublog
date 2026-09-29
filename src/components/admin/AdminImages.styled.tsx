"use client";

import styled from "@emotion/styled";
import { surface } from "@/styles/surface";

/**
 * 이미지 관리: 왼쪽 그리드 + 오른쪽 상세 패널.
 * 좁아지면 패널이 그리드 아래로 내려간다. 폭은 전부 CSS 가 나눈다.
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

  @container admin (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr);
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
