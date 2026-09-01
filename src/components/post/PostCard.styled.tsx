import styled from "@emotion/styled";
import Image from "next/image";

const Wrapper = styled.article`
  width: 100% !important;
  min-width: 290px;
  border: 1px solid var(--bordercolor);
  border-radius: 12px;
  overflow: hidden;
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
  width: 100% !important;
  min-height: 150px;
  max-height: 15rem;
  overflow: hidden;
`;

const StyledImage = styled(Image)`
  width: 100%;
  object-fit: cover;
  object-position: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  width: 100% !important;
  height: 10rem;
  padding: 1rem;
  background-color: var(--cardbackground);
`;

/**
 * 제목과 설명은 자리를 미리 잡아둔다.
 *
 * 줄 수를 막지 않으면 긴 제목·설명이 아래를 밀어내 푸터의 안쪽 여백이
 * 16px → 6px 로 줄고, 더 길면 푸터가 본문 밖으로 나가 날짜가 잘렸다.
 * 2lh 는 현재 line-height 로 정확히 두 줄이라 글자 크기를 건드리지 않는다.
 * 짧은 제목도 두 줄 자리를 차지하므로 카드끼리 줄이 맞는다.
 */
const clampTwoLines = `
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  height: 2lh;
  /* ContentDocumentLink 처럼 안 끊기는 긴 단어가 카드의 최소 폭을 밀어올린다 */
  overflow-wrap: anywhere;
`;

const Title = styled.h5`
  ${clampTwoLines};
  margin-bottom: 0.6rem;
  color: var(--foreground);
`;

const Desc = styled.p`
  ${clampTwoLines};
  color: var(--desccolor);
  margin-bottom: 0.8rem;
  line-height: 1.4;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* wrap 이면 태그가 길어질 때 날짜가 아랫줄로 떨어져 카드 높이가 흐트러진다 */
  flex-wrap: nowrap;
  margin-top: auto;
  font-size: 0.75rem;
  color: var(--desccolor);
  gap: 0.5rem;
`;

const Text = styled.p`
  font-size: 0.8rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

/** 자리가 모자라면 태그 쪽이 줄어들며 말줄임 된다. */
const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  /* flex 자식의 min-width 기본값이 auto 라, 이게 없으면 줄어들지 않고 날짜를 민다 */
  min-width: 0;

  img {
    flex-shrink: 0;
    filter: grayscale(100%);
    opacity: 0.6;
  }

  .tags {
    min-width: 0;
  }
`;

/** 날짜는 항상 온전히 보여야 한다. */
const Date = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: nowrap;
  flex-shrink: 0;

  img {
    flex-shrink: 0;
    opacity: 0.6;
  }
`;

export default {
  Wrapper,
  ImageWrapper,
  StyledImage,
  Body,
  Title,
  Desc,
  Footer,
  Text,
  Tag,
  Date,
};
