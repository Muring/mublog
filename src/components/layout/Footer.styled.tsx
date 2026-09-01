import styled from "@emotion/styled";

export const FooterWrapper = styled.footer`
  background-color: var(--background);
  color: var(--foreground);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1rem 2rem;
  border-top: 1px solid var(--bordercolor);
  text-align: center;
  font-size: 0.875rem;
  color: var(--desccolor);
  gap: 1rem;

  .stack {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    min-width: 25rem;
  }
`;
