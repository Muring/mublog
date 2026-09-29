"use client";

import styled from "@emotion/styled";
import { surface } from "@/styles/surface";
import { overlayBackdrop, overlayPanel } from "@/styles/motion";

/** 좁은 화면의 하단 시트. 뒤를 가리는 막 + 아래에 붙은 패널 */
export const SheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  top: var(--sheet-viewport-top, 0px);
  bottom: auto;
  height: var(--sheet-viewport-height, 100dvh);
  /*
   * 확인 대화상자(z-index 200)보다 아래에 둔다. 시트 안의 삭제 버튼이 그걸 띄운다.
   * 이미지 뷰어는 네이티브 dialog 의 top layer 라 이 값과 상관없이 위에 뜬다.
   */
  z-index: 100;
  display: flex;
  align-items: flex-end;
  /* 이미지 고르기 막과 같은 값. 두 테마 모두 검정이어야 한다 */
  background-color: rgba(0, 0, 0, 0.4);
  /* 막을 끌어도 뒤 페이지가 움직이지 않는다. 시트 안은 SheetPanel 이 세로 스크롤만 다시 허용한다 */
  touch-action: none;
  overscroll-behavior: contain;

  /* 막은 흐려졌다 짙어지고 닫힐 때 다시 흐려진다(공용 움직임). 시트 자체는 SheetPanel */
  ${overlayBackdrop}
`;

/**
 * 시트 본체. 막(SheetOverlay)의 data-closing 을 보고 아래로 내려간다 — 막 안의 자식 컴포넌트여야
 * 공용 움직임의 "[data-closing] &" 가 걸린다(막의 "> aside" 로 적으면 막 자신이 조상이 아니라 안 걸린다).
 */
export const SheetPanel = styled.aside`
  ${surface("12px")}
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  max-height: min(85dvh, calc(var(--sheet-viewport-height, 100dvh) - 16px));
  padding: 0;
  overflow: hidden;
  font-size: 13px;
  box-sizing: border-box;
  /* 시트 끝까지 굴려도 뒤 페이지로 스크롤이 넘어가지 않는다 */
  overscroll-behavior: contain;
  touch-action: pan-y;
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
  /* 아래에서 올라오고 아래로 내려간다(공용 움직임) */
  ${overlayPanel("sheet")}

  .sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .sheet-head h2 { margin: 0; font-size: 16px; font-weight: 700; }
  .sheet-head button { min-height: 44px; }

  .sheet-head { flex-shrink: 0; padding: 14px 16px; }
  .sheet-body { display: flex; flex-direction: column; gap: 14px; min-height: 0; padding: 0 16px max(16px, env(safe-area-inset-bottom)); overflow-y: auto; }
  .sheet-body:has(> form) { padding: 0; overflow: hidden; }
  .sheet-body > form { min-height: 0; }

  /* 초기화·확인 같은 마무리 버튼. 스크롤해도 늘 보이게 바닥에 붙이고 가로를 나눠 갖는다 */
  .sheet-foot {
    flex-shrink: 0;
    display: flex;
    gap: 8px;
    margin: 0;
    padding: 12px 14px max(14px, env(safe-area-inset-bottom));
    border-top: var(--border-width) solid var(--bordercolor);
    background: inherit;
  }
  .sheet-foot > * { flex: 1; justify-content: center; }
`;
