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
    /* 고정 min-width(25rem)면 432px 보다 좁은 화면에서 푸터가 화면 밖으로 밀려 나가 모바일 브라우저가 페이지 전체를 축소해 보였다 */
    width: min(25rem, 100%);

    /* 아이콘 셋(각 96px)도 그 폭 안에서 같이 줄어든다 */
    img { min-width: 0; max-width: 30%; height: auto; }
  }

  .links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--desccolor);

    a {
      color: var(--desccolor);
      text-decoration: none;

      &:hover {
        color: var(--foreground);
        text-decoration: underline;
      }
    }
  }
`;
