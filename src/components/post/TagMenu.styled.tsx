import styled from "@emotion/styled";
import { hoverSurface } from "@/styles/surface";

export const TagWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 3%;
  padding: 1rem;
  animation: fadeIn 1s ease forwards;
  animation-fill-mode: forwards;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.4rem 0.6rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0.2rem 0;
  }

  a:hover {
    ${hoverSurface}
    transition: 0.1s ease-in-out;
  }

  .active {
    background-color: var(--activecolor) !important;
    color: var(--activefontcolor) !important;
  }
`;
