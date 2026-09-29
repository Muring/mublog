import styled from "@emotion/styled";
import { hoverSurface } from "@/styles/surface";
import { mobile } from "@/styles/breakpoints";
import { overlayPanel } from "@/styles/motion";

export const MenuWrapper = styled.div`
  background-color: var(--background);
  color: var(--foreground);

  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* 메뉴 끝까지 굴려도 뒤 페이지로 스크롤이 넘어가지 않는다 */
  overscroll-behavior: contain;
  position: fixed;
  top: 0;
  left: 0;
  width: 420px;
  height: 100%;
  /* 위 오버레이와 같은 이유로 토큰을 쓰지 않는다. 서랍이 어두운 막 위에 떠 있어야 해서
     두 테마 모두 검정 그림자다 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 0 0.5rem;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  transition: 0.1s ease-in-out;
  /* 왼쪽에서 밀려 들어오고 왼쪽으로 나간다(공용 움직임). 닫히는 중에는 data-closing 이 붙는다 */
  ${overlayPanel("drawer")}

  ${mobile} {
    width: 100% !important;
    border-radius: 0;
  }

  a:hover {
    ${hoverSurface}

    /*
     * 설명 줄은 스스로 색을 정하고 있어서 위 color 상속이 닿지 않는다.
     * 제목만 뒤집히고 설명은 --desccolor 로 남아, 밝은 호버 면 위에서
     * 다크 기준 2.01:1 이 된다 (거의 안 보인다).
     */
    .side-desc {
      color: var(--hoverdesccolor);
    }
  }

  .side-header {
    display: flex;
    justify-content: space-between;
    margin: 0.5rem 0 1rem 0;

    .main-icon {
      margin: 0.5rem 0 0 0.5rem;
    }
  }

  .side-content {
    overflow: auto;
  }

  .side-menu-link {
    display: flex;
    justify-content: left;
    align-items: center;
    width: 100%;
    height: 2rem;
    padding: 0 1rem;
    font-weight: bold !important;
  }

  .side-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    bottom: auto;
    padding: 0.5rem 1rem 0.8rem 1rem;
    margin-top: auto;
    background-color: var(--background);

    p {
      font-size: 0.7rem;
    }
  }
`;
