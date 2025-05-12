import styled from "@emotion/styled";

export const IntroductionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 50rem;
  /* min-height: 80vh; */
  padding: 0 1rem;

  h5 {
    font-weight: 400;
  }

  h6 {
    font-weight: 900;
  }

  strong {
    font-weight: 800;
  }

  a {
    display: flex;
    height: 20px;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 800;
  }

  a:hover {
    text-decoration-line: underline;
  }

  .intro {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    padding: 0 1rem;
  }

  .intro-content {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    text-align: center;
    width: 50%;
    min-width: 18.5rem;
    min-height: 5rem;
  }

  .contact-content {
    display: flex;
    justify-content: space-between;
    width: 50%;
  }

  .link-content {
    display: flex;
    flex-direction: column;
    width: 48%;
    min-width: 7rem;
    gap: 1rem;
  }

  blockquote {
    border-left: 8px solid #888888;
    padding: 0.2rem 0 0.2rem 1rem;
    background: #fdfdfd;
    color: #424242;
    margin: 1.5rem 0;
    line-height: 2.5;
    border-radius: 0.5rem;

    p {
      margin: 0;
    }
  }
`;
