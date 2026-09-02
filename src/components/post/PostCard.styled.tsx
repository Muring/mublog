import styled from "@emotion/styled";
import Image from "next/image";
import { clampLines, truncate } from "@/styles/text";

/**
 * 모든 카드는 같은 높이다.
 *
 * 안쪽 네 덩어리가 저마다 자기 몫을 고정으로 갖는다.
 *   태그 한 줄 / 제목 두 줄 / 설명 세 줄 / 메타 한 줄
 * 내용 길이에 따라 늘어나는 곳이 없으므로 줄이 달라도 카드가 들쭉날쭉하지 않다.
 *
 * height: 100% 는 여전히 필요하다. 부모가 stretch 로 늘어난 경우
 * (썸네일 비율이 어긋나는 등) 메타 줄을 바닥에 붙여 두기 위해서다.
 */
const Wrapper = styled.article`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* 부모(li / Slide)가 늘어난 만큼 카드도 늘어나야 메타 줄이 바닥에 정렬된다 */
  height: 100%;
  border: 1px solid var(--bordercolor);
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--cardbackground);
  box-shadow: 0px 3px 5px -2px var(--shadowcolor);
  cursor: pointer;

  /* 초기 상태 */
  opacity: 0;
  transform: translateY(20px);

  /* 애니메이션 */
  animation: fadeInUp 0.5s ease forwards;
  animation-fill-mode: forwards;

  /* keyframes */
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  /* 카드 폭이 달라도(홈 329 / 캐러셀 255) 썸네일 비율은 같게 유지한다 */
  aspect-ratio: 16 / 9;
  flex-shrink: 0;
  overflow: hidden;
  background-color: var(--codefontbgcolor);
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  padding: 0.875rem 1rem 1rem;

  /*
   * 카드 높이를 여기서 책임진다.
   * 태그 1줄 + 제목 2줄 + 설명 3줄 + 메타 1줄이 다 들어가는 높이다.
   *
   * 제목·설명 상자를 각각 고정하면 제목이 한 줄일 때 제목과 설명 사이가 붕 뜬다.
   * 대신 본문 전체 높이만 잡아두고 글은 제 높이대로 두면, 남는 자리가
   * 메타 줄 위(margin-top: auto) 한 곳에만 모인다.
   */
  min-height: 12.5rem;
`;

/**
 * 태그는 언제나 한 줄이다.
 *
 * wrap 을 허용하면 태그가 많은 글만 카드가 길어져 줄이 들쭉날쭉해진다.
 * 넘치는 것은 +N 으로 접고, 그 위에 마우스를 올리면 나머지를 보여준다.
 */
const Tags = styled.div`
  /* 팝오버가 태그 줄 전체를 기준으로 놓이도록 여기서 기준점을 만든다 */
  position: relative;
  display: flex;
  gap: 0.3rem;
  height: 1.6em;
  font-size: 0.7rem;
  overflow: visible;

  .chip {
    flex-shrink: 0;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    background-color: var(--codefontbgcolor);
    color: var(--desccolor);
    font-weight: 700;
    line-height: 1.6;
    /* 태그 하나가 아주 길면 그것만 줄어들며 말줄임 된다 */
    min-width: 0;
    ${truncate}
  }

  .more {
    cursor: default;
  }

  /* 카드가 overflow: hidden 이므로 팝오버는 카드 안쪽(태그 줄 바로 아래)에 띄운다 */
  .popover {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    z-index: 2;
    display: none;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--bordercolor);
    border-radius: 8px;
    background-color: var(--background);
    color: var(--desccolor);
    box-shadow: 0px 3px 8px -2px var(--shadowcolor);
    /* 카드가 overflow: hidden 이라 폭을 넘기면 잘린다. 넘치면 줄바꿈시킨다 */
    max-width: 100%;
    white-space: normal;
    font-weight: 700;
  }

  .more:hover .popover {
    display: block;
  }
`;

/**
 * 제목은 두 줄까지.
 *
 * "모든 카드 높이 동일" 과 "임의 길이 제목 전부 표시" 는 동시에 성립하지 않는다.
 * 지금 글이 두 줄이라서 두 줄로 잡은 것이 아니라, 카드 격자에서 제목이 차지할
 * 몫을 두 줄로 정한 것이다. 더 긴 제목이 와도 말줄임될 뿐 격자는 흐트러지지 않는다.
 * 높이는 고정하지 않는다. 짧은 제목이 두 줄 상자를 차지하면 설명과의 사이가 벌어진다.
 * 잘린 전체 제목은 title 속성으로 볼 수 있고, 어차피 한 번 누르면 본문이다.
 */
const Title = styled.h5`
  ${clampLines(2)}
  color: var(--foreground);
  line-height: 1.35;
`;

/** 설명은 최대 세 줄. 넘치면 말줄임한다. */
const Desc = styled.p`
  ${clampLines(3)}
  color: var(--desccolor);
  font-size: 0.85rem;
  line-height: 1.45;
`;

/**
 * 날짜(왼쪽)와 조회·댓글(오른쪽). 항상 카드 바닥에 붙는다.
 *
 * 언제 쓴 글인지와 얼마나 읽혔는지는 성격이 다른 정보라 양 끝으로 나눈다.
 * 폭이 모자라면 오른쪽 묶음이 통째로 아랫줄로 내려간다 (숫자끼리는 붙어 있게).
 */
const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  /* 위 내용이 짧아도 이 줄은 바닥으로 내려간다 */
  margin-top: auto;
  padding-top: 0.5rem;
  color: var(--desccolor);
  font-size: 0.75rem;

  .group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }

  svg {
    flex-shrink: 0;
    opacity: 0.75;
  }
`;

export default {
  Wrapper,
  ImageWrapper,
  StyledImage,
  Body,
  Tags,
  Title,
  Desc,
  Meta,
};
