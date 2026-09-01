import styled from "@emotion/styled";
import { buttonQuiet } from "@/styles/button";

export const CARD_GAP = 20;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto 1rem auto;
  padding: 0 48px 60px 48px;

  h4 {
    padding: 2rem 0;
  }

  @media (max-width: 600px) {
    padding: 0 40px 40px 40px;
  }
`;

const Wrapper = styled.div`
  overflow: hidden;
  width: 100%;
`;

/**
 * 카드 폭은 JS 로 재지 않고 CSS 가 계산한다.
 *
 * 측정값을 상태로 들고 있으면 하이드레이션 전에는 폭이 0 이라 캐러셀이
 * 납작하게 그려진다. --card 안의 100% 는 Track 의 폭(=Wrapper 폭)을 가리키고,
 * Slide 의 flex-basis 와 Track 의 transform 이 같은 기준을 쓰므로
 * 첫 페인트부터 세 장이 정확히 들어맞는다.
 */
const Track = styled.div<{
  visible: number;
  currentIndex: number;
  isTransitioning: boolean;
}>`
  --gap: ${CARD_GAP}px;
  --visible: ${(props) => props.visible};
  --card: calc((100% - var(--gap) * (var(--visible) - 1)) / var(--visible));

  display: flex;
  gap: var(--gap);
  padding-top: 0.5rem;
  transform: translateX(
    calc(-1 * ${(props) => props.currentIndex} * (var(--card) + var(--gap)))
  );
  transition: ${({ isTransitioning }) => (isTransitioning ? "transform 0.5s ease-in-out" : "none")};
`;

const Slide = styled.div`
  flex: 0 0 var(--card);
  /* flex 아이템의 min-width 기본값이 auto 라, 안 끊기는 긴 단어가 있으면
     flex-basis 를 무시하고 슬라이드가 넓어진다 (254.7 -> 313). */
  min-width: 0;
  box-sizing: border-box;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;

  /* 기본값이 inline 이라 카드 폭도 높이도 잡아주지 못한다.
     높이는 메타 줄을 카드 바닥에 붙이는 데 필요하다. */
  a {
    display: block;
    height: 100%;
  }

  /* 카드는 홈 그리드 기준 min-width: 290px 를 갖는다.
     캐러셀은 남은 자리를 나눠 쓰므로 그보다 좁아질 수 있어 여기서만 푼다. */
  article {
    min-width: 0;
  }

  &:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0px 6px 5px -2px var(--shadowcolor);
  }
`;

/**
 * 좌우 화살표.
 *
 * 원래는 배경도 테두리도 없는 맨 < > 글자라 눌리는 것인지 알기 어려웠다.
 * 다른 버튼과 같은 조각을 깔아 생김새를 맞춘다.
 */
const ArrowButton = styled.button`
  ${buttonQuiet};
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  color: var(--foreground);
  /* 라이트에서는 카드 배경도 테두리도 흰 배경과 1.25:1 이라 버튼 윤곽이 보이지 않는다.
     카드와 같은 그림자를 줘서 떠 있는 버튼으로 읽히게 한다. */
  box-shadow: 0px 3px 5px -2px var(--shadowcolor);
  transform: translateY(-50%);
  z-index: 1;

  &:hover:not(:disabled) {
    box-shadow: 0px 4px 8px -2px var(--shadowcolor);
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
`;

export default {
  Container,
  Wrapper,
  Track,
  Slide,
  ArrowButton,
};
