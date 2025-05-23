import styled from "@emotion/styled";

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto 1rem auto;
  padding: 0 40px 60px 40px;

  h4 {
    padding: 2rem 0;
  }
`;

const Wrapper = styled.div`
  overflow: hidden;
  width: 100%;
`;

const Track = styled.div<{
  cardGap: number;
  cardWidth: number;
  currentIndex: number;
  isTransitioning: boolean;
}>`
  display: flex;
  gap: ${(props) => props.cardGap}px;
  padding-top: 0.5rem;
  transform: ${({ cardGap, cardWidth, currentIndex }) =>
    `translateX(-${(cardWidth + cardGap) * currentIndex - 70}px)`};
  transition: ${({ isTransitioning }) => (isTransitioning ? "transform 0.5s ease-in-out" : "none")};
`;

const Slide = styled.div<{ cardWidth: number }>`
  flex-shrink: 0;
  width: ${(props) => props.cardWidth}px;
  box-sizing: border-box;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0px 6px 5px -2px rgba(0, 0, 0, 0.15);
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: 0.2s all ease-in;
  background: transparent;
  border: none;
  font-size: 36px;
  cursor: pointer;
  z-index: 1;

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }

  &:hover {
    transform: translateY(-50%) scale(1.2);
  }
`;

// const Dots = styled.div`
//   text-align: center;
//   margin-top: 10px;
// `;

// const Dot = styled.button`
//   display: inline-block;
//   width: 10px;
//   height: 10px;
//   background: #ccc;
//   border-radius: 50%;
//   margin: 0 5px;
//   border: none;
//   cursor: pointer;

//   &.active {
//     background: #333;
//   }
// `;

export default {
  Container,
  Wrapper,
  Track,
  Slide,
  ArrowButton,
};
