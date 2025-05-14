import styled from "@emotion/styled";

export const ProfileWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  animation: fadeIn 1s ease forwards;
  animation-fill-mode: forwards;

  .text-container {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    text-align: start;
  }

  .contact {
    font-size: 0.8rem;
    color: #777;
  }

  p {
    font-size: 0.8rem;
    font-weight: 500;
  }
`;
