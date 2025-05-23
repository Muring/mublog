import styled from "@emotion/styled";

export const PostGridWrapper = styled.div`
  max-width: 1050px;
  min-height: 80vh;
  padding: 0 1rem;

  @media (max-width: 640px) {
    width: 100% !important;
  }
`;

export const GridList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0 4rem;

  li {
    border-radius: 12px;
    transition: all 0.2s ease-in-out;

    &:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0px 6px 5px -2px rgba(0, 0, 0, 0.15);
    }
  }

  @media (max-width: 928px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    width: 100% !important;
    grid-template-columns: repeat(1, 1fr);
  }
`;
