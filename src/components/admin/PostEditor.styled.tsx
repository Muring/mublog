"use client";

import styled from "@emotion/styled";
import { Article } from "@/components/PostContent.styled";

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
    color: #d93025;
  }
`;

export const MetaGrid = styled.div`
  display: grid;
  /* 제목 / 설명 / slug / 썸네일 을 한 줄에 두고, 태그는 그 아래 한 줄을 차지한다 */
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;

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

  .field-error {
    font-size: 0.7rem;
    color: #d93025;
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
  .span-all {
    grid-column: 1 / -1;
  }

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }

  .thumb-row {
    display: flex;
    gap: 0.35rem;
  }
  .thumb-row input {
    flex: 1;
    min-width: 0;
  }

  .thumb-upload {
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--bordercolor);
    border-radius: 0.4rem;
    background-color: var(--cardbackground);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
  }
  .thumb-upload:hover:not(:disabled) {
    background-color: var(--hovercolor);
    color: var(--hoverfontcolor);
  }
  .thumb-upload:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .thumb-preview {
    margin-top: 0.35rem;
    max-height: 5rem;
    width: auto;
    border: 1px solid var(--bordercolor);
    border-radius: 0.4rem;
    object-fit: cover;
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

  &.dragging textarea {
    background-color: var(--hovercolor);
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
