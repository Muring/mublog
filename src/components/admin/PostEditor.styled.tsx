"use client";

import styled from "@emotion/styled";
import { buttonBase } from "@/styles/button";
import { Article } from "@/components/post/PostContent.styled";
import { surface } from "@/styles/surface";
import { hoverSurface } from "@/styles/surface";

export const EditorWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  /* 헤더가 position: fixed / height 64px 이므로 그만큼 비워준다 */
  padding: 6rem 1rem 3rem;

  /*
   * 저장·발행을 화면에 붙여 둔다. 본문 끝에서 저장하려고 맨 위까지 되돌아가야 했다.
   *
   * top 은 헤더 높이(position: fixed / 64px)와 같아야 그 바로 아래에 걸린다.
   * 아래 여백을 margin 이 아니라 padding 으로 두는 이유는, margin 은 배경이 없어
   * 그 틈으로 밑에서 올라오는 내용이 비쳐 보이기 때문이다.
   */
  .editor-head {
    position: sticky;
    top: 64px;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem 0 1rem;
    margin-bottom: 0.5rem;
    background-color: var(--background);
    border-bottom: 1px solid var(--bordercolor);
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
   * 오른쪽 폭은 목록 카드와 같은 --card-width 를 쓰되 상한이 걸린 값이다.
   * 상한이 없으면 목록이 3열 -> 2열로 넘어가는 1px 지점에서 카드가 290 -> 443 이
   * 되고, 그만큼 왼쪽이 한 번에 153px 를 잃어 화면이 반반으로 꺾인다.
   */
  grid-template-columns: minmax(0, 1fr) var(--card-width-capped);
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
    ${surface("0.4rem")}
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
    color: var(--okcolor);
    font-weight: 500;
  }
  .field-hint {
    font-size: 0.7rem;
    color: var(--desccolor);
    font-weight: 500;
  }


  .thumb-row {
    display: flex;
    gap: 0.35rem;
    /* 아래 미리보기와 폭을 맞춘다 */
    max-width: var(--card-width-capped);
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
  /*
   * 썸네일을 끌어다 놓는 자리. 미리보기 상자가 곧 드롭 영역이다 —
   * 점선 상자를 따로 두면 이미지가 들어온 뒤에는 놓을 자리가 없어진다.
   * 폭과 위 여백은 여기가 갖는다. 안쪽 둘이 각각 들면 어느 쪽이 보이느냐에 따라
   * 여백이 겹치거나 무너진다.
   */
  .thumb-drop {
    margin-top: 0.35rem;
    width: 100%;
    max-width: var(--card-width-capped);
    border-radius: 12px;
  }

  /*
   * 가리키는 색을 그대로 쓴다. 목록 제목·추이 그래프와 같은 "여기" 라는 신호다.
   *
   * 테두리 색만 바꾸면 밝은 썸네일 위에서는 1px 이 묻혀 거의 보이지 않는다.
   * 상자 바깥에 윤곽선을 더한다 — outline 은 자리를 차지하지 않아 끌어오는 동안
   * 폼이 밀리지 않는다. 초점 표시와 같은 방식이다.
   */
  .thumb-drop.dragging {
    outline: 2px solid var(--linkhovercolor);
    outline-offset: 2px;
  }

  .thumb-drop.dragging .thumb-preview,
  .thumb-drop.dragging .thumb-empty {
    border-color: var(--linkhovercolor);
    background-color: var(--codefontbgcolor);
  }

  .thumb-preview {
    /* inline 이면 글꼴 베이스라인만큼 상자 아래에 빈 줄이 생긴다 */
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    object-position: center;
    border: 1px solid var(--bordercolor);
    border-radius: 12px;
    background-color: var(--codefontbgcolor);
  }

  /* 이미지가 없을 때도 자리를 지켜 폼이 위아래로 튀지 않는다 */
  .thumb-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    width: 100%;
    aspect-ratio: 16 / 9;
    padding: 0 0.75rem;
    border: 1px dashed var(--bordercolor);
    border-radius: 12px;
    color: var(--desccolor);
    font-size: 0.8rem;
    font-weight: 400;
    text-align: center;
  }

  /*
   * 크기로만 층을 나눈다. opacity 로 낮추면 감사기는 color 만 보므로
   * 측정에는 안 잡히고 실제로는 안 보이는 상태가 된다.
   */
  .thumb-empty .hint {
    font-size: 0.7rem;
  }


  /*
   * 목록이 1열이 되는 지점(627px)에서 에디터도 한 열로 쌓는다.
   * 이 아래로는 카드 폭이 곧 화면 폭이라 옆에 붙일 자리가 없다.
   * 컨테이너가 아니라 뷰포트를 보는 이유는 목록의 열 수가 뷰포트로 정해지기 때문이다.
   */
  @media (max-width: 627px) {
    grid-template-columns: minmax(0, 1fr);

    .thumb-row,
    .thumb-drop {
      max-width: none;
    }
  }
`;

/**
 * 본문과 미리보기.
 *
 * 900px 아래에서는 좌우로 놓을 자리가 없다. 예전에는 위아래로 쌓았는데
 * 본문 입력란이 화면을 가득 채우다 보니 미리보기가 한참 아래로 밀려
 * 사실상 보이지 않았다. 좁아지면 탭으로 바꿔 한 번에 하나만 보여준다.
 */
export const SplitPane = styled.div<{ activeTab: "write" | "preview" }>`
  /*
   * 두 칸의 높이를 화면 높이로 고정하고 각자 제 안에서 스크롤한다.
   *
   * 예전에는 미리보기가 내용만큼 늘어나 글이 길어질수록 페이지가 함께 길어졌고,
   * 본문 입력란은 60vh 에 멈춰 있었다. 그래서 아래를 보려면 페이지를 한참 내리고
   * 쓰려면 다시 올라와야 했다. 높이는 바깥 상자가 잡고 글은 제 높이대로 둔다.
   *
   * 빼는 값은 위아래로 고정된 것들의 합이다 — 헤더 64px, 붙어 있는 저장 줄,
   * 아래 여백. 저 줄의 높이를 바꾸면 이 값도 함께 봐야 한다.
   *
   * vh 가 아니라 dvh 다. 모바일에서 주소창이 접혔다 펴지면 vh 는 그대로라
   * 칸의 아래쪽이 잘린다. 사용자 정의 속성에는 "모르면 앞 줄로 되돌아가기" 가
   * 없으므로(파싱 단계에서는 무엇이든 유효하다) vh 를 앞에 덧대지 않는다 —
   * 이 저장소는 이미 컨테이너 쿼리를 쓰고 있고 그쪽 지원선이 dvh 보다 높다.
   */
  --pane-height: calc(100dvh - 13rem);

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;

  .pane-write,
  .pane-preview {
    height: var(--pane-height);
    /* 화면이 아주 낮아도 몇 줄은 보여야 한다 */
    min-height: 22rem;
  }

  /*
   * 테두리를 안쪽 PreviewArticle 이 아니라 여기가 갖는다.
   * 스크롤하는 상자가 테두리를 가져야 위아래 선이 제자리에 남는다.
   */
  .pane-preview {
    overflow-y: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--bordercolor);
    border-radius: 0.75rem;
  }

  /* 넓을 때는 탭이 필요 없다 */
  .pane-tabs {
    display: none;
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);

    /* 책갈피처럼 가로를 반씩 나눠 갖는다 */
    .pane-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid var(--bordercolor);
      margin-bottom: 0.75rem;
    }

    /* 고른 쪽만 남긴다. 감추는 쪽은 DOM 에 그대로 두어
       탭을 오갈 때 입력 중이던 내용과 커서가 유지된다. */
    .pane-write {
      display: ${(props) => (props.activeTab === "write" ? "flex" : "none")};
    }
    .pane-preview {
      display: ${(props) => (props.activeTab === "preview" ? "block" : "none")};
    }
  }
`;

/**
 * 책갈피형 탭.
 *
 * 버튼 두 개를 나란히 두는 대신 가로를 반씩 갖고 아래 선으로 이어지게 한다.
 * 고른 쪽은 색만 바꾸지 않고 밑줄을 함께 줘서, 색이 잘 안 보이는 상황에서도
 * 어느 쪽이 열려 있는지 알 수 있다.
 */
export const PaneTab = styled.button`
  background: none;
  border: none;
  /* 선택 표시가 켜졌다 꺼졌다 하며 높이가 변하지 않도록 자리를 미리 잡는다 */
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  padding: 0.65rem 0;
  color: var(--desccolor);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out;

  &:hover:not(.active) {
    color: var(--foreground);
  }

  &.active {
    color: var(--foreground);
    border-bottom-color: var(--foreground);
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

  /*
   * 칸이 이미 화면 높이만큼 잡혀 있으므로 남는 자리를 전부 쓴다.
   * min-height 를 함께 두면 flex 아이템의 기본값(auto)이 내용 높이를 바닥으로
   * 삼아 줄어들지 못하고, 스크롤이 입력란이 아니라 페이지에 생긴다.
   *
   * 손으로 늘리는 것은 막는다. 상자 높이는 위에서 정해지므로 여기서 늘리면
   * 칸을 삐져나가고, 이제는 늘릴 이유도 없다.
   */
  textarea {
    width: 100%;
    flex: 1;
    min-height: 0;
    resize: none;
    overflow-y: auto;
    /* 입력란 끝에서 굴려도 페이지가 따라 움직이지 않게 한다 */
    overscroll-behavior: contain;
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

/**
 * 툴바 버튼.
 *
 * 아이콘만 있는 버튼이라 이름이 화면에 없다. 그래서 두 가지를 함께 준다 —
 * 눈으로 보는 사람에게는 호버 툴팁을, 스크린리더에는 aria-label 을.
 * 툴팁만 두면 키보드나 스크린리더 사용자는 버튼이 무엇인지 알 방법이 없다.
 *
 * 툴팁 문구는 data-tip 에서 가져온다. title 속성을 쓰지 않는 이유는 브라우저가
 * 그리는 것이라 테마를 따르지 않고, 뜨기까지 1초 넘게 걸리기 때문이다.
 */
export const ToolbarButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
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
    ${hoverSurface}
  }

  /*
   * 글자로 남긴 서식 버튼(B / I)은 그 서식대로 보여야 뜻이 읽힌다.
   * 특히 산세리프 대문자 I 는 곧게 서 있어서 그냥 세로줄로 보이고
   * 기울임이라는 것이 전혀 드러나지 않았다. 세리프를 써야 기울기가 눈에 띈다.
   */
  &.mark {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 0.95rem;
    line-height: 1;
  }
  &.mark.italic {
    font-style: italic;
  }

  /* 키보드로 옮겨왔을 때도 이름이 보여야 한다 */
  &[data-tip]:hover::after,
  &[data-tip]:focus-visible::after {
    content: attr(data-tip);
    position: absolute;
    top: calc(100% + 0.35rem);
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 0.25rem 0.5rem;
    border-radius: 0.35rem;
    background-color: var(--foreground);
    color: var(--background);
    /*
     * 버튼의 서식을 물려받지 않도록 되돌린다. ::after 는 버튼의 자식이라
     * 기울임 버튼에서는 설명 문구까지 Georgia 기울임으로 나왔다.
     * 설명은 어느 버튼에서든 같은 모양이어야 한다.
     */
    font-family: var(--font-body);
    font-style: normal;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    pointer-events: none;
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
  animation: none;
`;
