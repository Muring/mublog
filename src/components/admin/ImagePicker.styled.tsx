"use client";

import styled from "@emotion/styled";
import { buttonBase } from "@/styles/button";
import { surface } from "@/styles/surface";

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
`;

export const PickerBox = styled.div`
  ${surface("14px")}
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

  input[type="search"] {
    flex: 1;
    min-width: 8rem;
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

  .empty,
  .loading {
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
  ${buttonBase}
  padding: 0.4rem 0.7rem;
  font-size: 0.78rem;
  white-space: nowrap;

  &.active {
    background-color: var(--foreground);
    color: var(--background);
    border-color: var(--foreground);
  }
`;

export const ImageCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.4rem;
  border: 1px solid var(--bordercolor);
  border-radius: 10px;
  background: none;
  color: var(--foreground);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  /* grid 아이템의 기본값이 auto 라, 안 끊기는 파일명이 칸 폭을 밀어낸다 */
  min-width: 0;

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

  .badge {
    flex-shrink: 0;
    padding: 0.05rem 0.35rem;
    border-radius: 999px;
    font-size: 0.6rem;
    font-weight: 700;
    border: 1px solid var(--okborder);
    background-color: var(--okbg);
    color: var(--okcolor);
  }

  /* 아무 글도 안 쓰는 이미지. 지워도 되는 것이라 눈에 걸려야 한다 */
  .badge.unused {
    border-color: var(--warnborder);
    background-color: var(--warnbg);
    color: var(--warncolor);
  }

  &:hover,
  &:focus-visible {
    border-color: var(--linkhovercolor);
    outline: none;
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
  }
`;
