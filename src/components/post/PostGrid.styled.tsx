import styled from "@emotion/styled";
import { cardHoverLift } from "@/styles/surface";

export const PostGridWrapper = styled.div`
  /*
   * 부모(.home)가 align-items: center 인 flex 라 이 요소는 내용에 맞춰 줄어든다.
   * 예전에는 카드의 min-width 290px 이 3열분의 폭을 붙잡아 줘서 우연히 넓어졌지만,
   * 열 수를 폭에서 구하도록 바꾸면 그 받침이 사라져 2열로 접힌다.
   */
  width: 100%;
  max-width: 1050px;
  min-height: 80vh;
  padding: 0 1rem;
`;

export const GridList = styled.div`
  display: grid;
  /*
   * 캐러셀과 같은 규칙: 열 수를 폭에서 거꾸로 구한다.
   * 카드 최소 폭이 290px 이고 그리드가 최대 1018px 이라 데스크톱은 그대로 3열,
   * 좁아지면 2열·1열로 알아서 내려간다. min() 은 290px 보다 좁은 화면에서
   * 열이 화면을 넘지 않게 막는다.
   */
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
  gap: 1rem;
  padding: 1rem 0 4rem;

  li {
    /* 그리드 아이템도 기본 min-width 가 auto 라 긴 단어가 열을 넓힌다 */
    min-width: 0;
    border-radius: 12px;

    /* 카드가 행 높이를 채워야 메타 줄이 카드 바닥에 정렬된다.
       a 는 기본이 inline 이라 높이를 물려주지 못한다. */
    > a {
      display: block;
      height: 100%;
    }
    transition: all 0.2s ease-in-out;

    &:hover {
      ${cardHoverLift}
    }
  }
`;
