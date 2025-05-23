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

const Title = styled.h5`
  margin-bottom: 0.6rem;
  color: var(--foreground);
`;

const Desc = styled.p`
  color: var(--desccolor);
  margin-bottom: 0.8rem;
  line-height: 1.4;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  bottom: 0;
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

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  img {
    filter: grayscale(100%);
    opacity: 0.6;
  }

  .tags {
    width: 100%;
  }
`;

const Date = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: nowrap;

  img {
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
