"use client";

import styled from "@emotion/styled";
import { buttonBase } from "@/styles/button";
import { Article } from "@/components/post/PostContent.styled";

export const EditorWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  /* 헤더가 position: fixed / height 64px 이므로 그만큼 비워준다 */
  padding: 6rem 1rem 3rem;

  .editor-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .status-text {
    font-size: 0.8rem;
    color: var(--desccolor);
  }
  .status-text.error {
    color: var(--dangercolor);
  }
`;

export const MetaGrid = styled.div`
  display: grid;
  /*
   * 왼쪽은 글 자체(제목·설명·글 주소·태그), 오른쪽은 썸네일이다.
   * 오른쪽 폭은 globals.css 의 --card-width 를 그대로 쓴다. 목록의 카드가
   * 뷰포트에 따라 3/2/1 열로 바뀌며 폭이 변하므로, 미리보기도 같이 변해야
   * "목록에서 보일 크기" 라는 말이 실제로 맞는다.
   */
  grid-template-columns: minmax(0, 1fr) var(--card-width);
  gap: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;

  /*
   * 양쪽 열 모두 세로로 쌓는다.
   * 간격이 0.75rem 이면 왼쪽 네 덩어리(제목·설명·글주소·태그)의 합이
   * 오른쪽(썸네일 + 미리보기)보다 10px 길어진다. 0.5rem 이면 거의 맞아떨어진다.
   */
  .meta-left,
  .meta-right {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label,
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--desccolor);
  }

  input,
  select {
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--bordercolor);
    border-radius: 0.4rem;
    background-color: var(--cardbackground);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--bordercolor);
    outline-offset: 1px;
  }

  /* 라벨과 판정 문구를 한 줄에서 양 끝으로 벌린다 */
  .label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .field-error {
    font-size: 0.7rem;
    color: var(--dangercolor);
    font-weight: 500;
  }
  .field-ok {
    font-size: 0.7rem;
    color: #1a7f37;
    font-weight: 500;
  }
  .field-hint {
    font-size: 0.7rem;
    color: var(--desccolor);
    font-weight: 500;
  }

  /* 태그는 칩이 여러 줄로 늘어나므로 한 줄 전체를 쓴다 */

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }

  .thumb-row {
    display: flex;
    gap: 0.35rem;
    /* 아래 미리보기와 폭을 맞춘다 */
    max-width: var(--card-width);
  }
  .thumb-row input {
    flex: 1;
    min-width: 0;
  }

  .thumb-upload {
    ${buttonBase}
    padding: 0.5rem 0.7rem;
    font-size: 0.78rem;
    white-space: nowrap;
  }

  /*
   * 카드의 썸네일과 같은 비율·같은 폭이라 목록에서 어떻게 잘릴지 그대로 보인다.
   * 한 열로 접히면 열이 넓어지므로 카드 폭을 상한으로 걸어 크기를 유지한다.
   */
  .thumb-preview {
    margin-top: 0.35rem;
    width: 100%;
    max-width: var(--card-width);
    aspect-ratio: 16 / 9;
    object-fit: cover;
    object-position: center;
    border: 1px solid var(--bordercolor);
    border-radius: 12px;
    background-color: var(--codefontbgcolor);
  }

  /* 이미지가 없을 때도 자리를 지켜 폼이 위아래로 튀지 않는다 */
  .thumb-empty {
    margin-top: 0.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: var(--card-width);
    aspect-ratio: 16 / 9;
    border: 1px dashed var(--bordercolor);
    border-radius: 12px;
    color: var(--desccolor);
    font-size: 0.75rem;
    font-weight: 400;
  }


  /*
   * 목록이 1열이 되는 지점(627px)에서 에디터도 한 열로 쌓는다.
   * 이 아래로는 카드 폭이 곧 화면 폭이라 옆에 붙일 자리가 없다.
   * 컨테이너가 아니라 뷰포트를 보는 이유는 목록의 열 수가 뷰포트로 정해지기 때문이다.
   */
  @media (max-width: 627px) {
    grid-template-columns: minmax(0, 1fr);

    .thumb-row,
    .thumb-preview,
    .thumb-empty {
      max-width: none;
    }
  }
`;

export const SplitPane = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const EditorColumn = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--bordercolor);
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: var(--cardbackground);

  .toolbar {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    padding: 0.4rem;
    border-bottom: 1px solid var(--bordercolor);
  }

  .pane-label {
    padding: 0.4rem 0.75rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--desccolor);
    border-bottom: 1px solid var(--bordercolor);
  }

  textarea {
    width: 100%;
    min-height: 60vh;
    resize: vertical;
    border: none;
    padding: 1rem;
    background-color: var(--cardbackground);
    color: var(--foreground);
    font-family: "Consolas", monospace;
    font-size: 0.85rem;
    line-height: 1.9;
    tab-size: 4;

    &:focus {
      outline: none;
    }
  }

  /* 입력한 글이 묻히지 않도록 배경만 한 톤 바꾼다 */
  &.dragging textarea {
    background-color: var(--codefontbgcolor);
  }
`;

export const ToolbarButton = styled.button`
  padding: 0.3rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 0.35rem;
  background: none;
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background-color: var(--hovercolor);
    color: var(--hoverfontcolor);
  }
`;

/**
 * 미리보기 본문.
 *
 * 실제 포스트 페이지가 쓰는 Article 을 그대로 상속하므로,
 * 타이포그래피·코드블록·콜아웃이 발행 결과와 자동으로 일치한다.
 * 스플릿 페인에 맞게 여백만 줄인다.
 */
export const PreviewArticle = styled(Article)`
  min-height: 0;
  max-width: 100%;
  padding: 1rem;
  border: 1px solid var(--bordercolor);
  border-radius: 0.75rem;
  animation: none;
`;
