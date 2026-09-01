import styled from "@emotion/styled";
import Image from "next/image";

/**
 * 카드 높이는 고정하지 않는다.
 *
 * 예전에는 Body 를 10rem 으로 못박고 제목·설명을 두 줄씩 잘랐다. 태그와 날짜가
 * 한 줄을 나눠 쓰다 보니 태그가 길면 날짜가 밀려나기까지 했다.
 *
 * 지금은 내용이 필요한 만큼 차지하고, 같은 줄에 놓인 카드끼리는 grid/flex 의
 * stretch 로 높이가 맞는다. 메타 줄은 margin-top: auto 로 항상 바닥에 붙는다.
 * 그래서 태그도 제목도 잘리지 않으면서 한 줄 안의 카드들은 나란히 보인다.
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
  /* 카드에서 썸네일을 뺀 나머지를 전부 차지한다 */
  flex: 1;
  min-height: 0;
  padding: 0.875rem 1rem 1rem;
`;

/** 태그는 전부 보여야 하므로 줄바꿈을 허용한다. 말줄임하지 않는다. */
const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;

  .chip {
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    background-color: var(--codefontbgcolor);
    color: var(--desccolor);
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1.6;
    white-space: nowrap;
  }
`;

/** 줄 수를 제한하지 않는다. 제목이 잘리면 어떤 글인지 알 수 없다. */
const Title = styled.h5`
  color: var(--foreground);
  line-height: 1.35;
  /*
   * 한글은 기본적으로 음절 사이에서 끊겨 "뜯어보 / 기" 처럼 한 글자만 남는다.
   * keep-all 로 띄어쓰기에서만 끊고, 혼자서도 한 줄에 못 들어가는
   * 단어(ContentDocumentLink)는 break-word 가 받아준다.
   */
  word-break: keep-all;
  overflow-wrap: break-word;
`;

/** 설명은 최대 세 줄. 넘치면 말줄임한다. */
const Desc = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  color: var(--desccolor);
  font-size: 0.85rem;
  line-height: 1.45;
  word-break: keep-all;
  overflow-wrap: break-word;
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
