"use client";

import styled from "@emotion/styled";
import { buttonSubtle } from "@/styles/button";
import { surface } from "@/styles/surface";
import { overlayBackdrop, overlayPanel } from "@/styles/motion";
import { mobile } from "@/styles/breakpoints";

export const PickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  /*
   * 토큰을 쓰지 않는 자리다. 뒤를 가리는 막이라 두 테마 모두 검정이어야 한다.
   * --shadowcolor 는 다크에서 흰색 계열이라 여기 쓰면 화면이 뿌옇게 밝아진다.
   * (헤더의 Overlay 와 같은 값)
   */
  background-color: rgba(0, 0, 0, 0.4);
  /* 막을 끌어도 뒤 에디터가 움직이지 않는다. 목록은 .picker-body 가 제 안에서 굴린다 */
  touch-action: none;
  ${overlayBackdrop}
`;

export const PickerBox = styled.div`
  ${surface("14px")}
  /* 살짝 떠오르며 나타나고 가라앉으며 사라진다(공용 움직임). 막의 data-closing 을 따른다 */
  ${overlayPanel("pop")}
  display: flex;
  flex-direction: column;
  width: min(920px, 100%);
  /* 목록만 굴러가고 머리줄과 아래줄은 제자리에 남는다 */
  max-height: min(80dvh, 44rem);
  overflow: hidden;

  .picker-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid var(--bordercolor);
  }

  h3 {
    font-size: 0.95rem;
    font-weight: 800;
    margin-right: auto;
  }

  /*
   * 둘째 줄: 검색 · 글 필터 · 정렬. 셋의 높이를 36px 로 맞춘다(Dropdown md 와 같은 높이).
   * 좁아지면 검색이 한 줄을 다 쓰고 글 필터가 남는 폭을, 정렬이 제 폭을 가진다.
   */
  .picker-filters {
    display: flex;
    flex: 1 1 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-width: 0;
  }
  .picker-filters .post-filter {
    flex: 0 1 15rem;
    min-width: 0;
  }
  .picker-filters .post-filter > button { width: 100%; }
  ${mobile} {
    .picker-filters input[type="search"] { flex-basis: 100%; }
    .picker-filters .post-filter { flex: 1 1 0; }
  }

  input[type="search"] {
    flex: 1;
    min-width: 8rem;
    box-sizing: border-box;
    height: 36px;
    padding: 0 0.65rem;
    ${surface("0.5rem")}
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.85rem;
  }

  .sources {
    display: flex;
    gap: 0.25rem;
  }

  .picker-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1rem;
  }

  /*
   * 폭 계산은 CSS 에 맡긴다. 몇 장이 들어갈지 재서 상태로 들면
   * 하이드레이션 전에 0 이라 납작하게 그려진다.
   */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
    gap: 0.75rem;
  }

  .empty {
    padding: 3rem 0;
    text-align: center;
    font-size: 0.85rem;
    color: var(--desccolor);
  }

  .picker-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--bordercolor);
    font-size: 0.75rem;
    color: var(--desccolor);
  }
`;

/** 출처 거르개. 고른 쪽만 면이 진해진다 */
export const SourceTab = styled.button`
  ${buttonSubtle}
  padding: 0.4rem 0.7rem;
  font-size: 0.78rem;
  white-space: nowrap;

  &.active {
    background-color: var(--foreground);
    color: var(--background);
    border-color: var(--foreground);
    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--foreground) 92%, var(--background));
      color: var(--background);
      border-color: var(--foreground);
    }
  }
`;

export const ImageCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.4rem;
  border: var(--border-width) solid var(--bordercolor);
  border-radius: 10px;
  background: none;
  color: var(--foreground);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  /* grid 아이템의 기본값이 auto 라, 안 끊기는 파일명이 칸 폭을 밀어낸다 */
  min-width: 0;
  outline: 1px solid transparent;
  outline-offset: calc(-1 * var(--border-width));
  transition: outline-color 150ms ease, border-color 150ms ease;

  img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 6px;
    background-color: var(--codefontbgcolor);
  }

  .name {
    font-size: 0.7rem;
    font-family: "Consolas", monospace;
    /* uuid 파일명이 칸을 밀어내지 않게 자른다 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.65rem;
    color: var(--desccolor);
    /* 쓰임이 길어도 카드 높이가 들쭉날쭉해지지 않게 한 줄로 자른다 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /*
   * 썸네일·본문은 "무엇으로 쓰이는지" 라는 분류다. 상태색(--okcolor 등)을
   * 여기 돌려쓰지 않는다 - 그쪽은 "정상/주의" 라는 뜻을 이미 갖고 있다
   * (globals.css 의 --chartbar 주석과 같은 이유).
   */
  .badge {
    flex-shrink: 0;
    padding: 0.05rem 0.35rem;
    border-radius: 999px;
    font-size: 0.6rem;
    font-weight: 700;
    border: var(--border-width) solid var(--bordercolor);
    background-color: var(--codefontbgcolor);
    color: var(--foreground);
  }

  /* 이건 분류가 아니라 손볼 거리다. 그래서 상태색을 쓴다 */
  .badge.unused {
    border-color: var(--warnborder);
    background-color: var(--warnbg);
    color: var(--warncolor);
  }

  /* 미사용이지만 아직 유예 중(이미지 관리). 분류처럼 중립이되 점선으로 "곧 바뀔 상태" 를 드러낸다 */
  .badge.grace {
    border-style: dashed;
    background-color: transparent;
  }

  &:hover {
    border-color: transparent;
    outline-color: var(--linkhovercolor);
  }

  /* 키보드에는 색만으로 알리지 않는다 */
  &:focus-visible {
    outline: 2px solid var(--linkhovercolor);
    outline-offset: 2px;
  }

  /* 지금 쓰고 있는 이미지 */
  &.current {
    border-color: var(--foreground);
    box-shadow: inset 0 0 0 1px var(--foreground);
    &:hover { border-color: var(--foreground); outline-color: transparent; }
  }
`;
