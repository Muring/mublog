import styled from "@emotion/styled";

export const CardWrapper = styled.article`
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

  .image-wrapper {
    width: 100% !important;
    min-height: 150px;
    max-height: 15rem;
    overflow: hidden;

    .thumbnail {
      width: 100%;
      object-fit: cover;
      object-position: center;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    width: 100% !important;
    height: 10rem;
    padding: 1rem;
    background-color: var(--cardbackground);

    .title {
      margin-bottom: 0.6rem;
      color: var(--foreground);
    }

    .description {
      color: var(--desccolor);
      margin-bottom: 0.8rem;
      line-height: 1.4;
    }

    .footer {
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

      p {
        font-size: 0.8rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tag-container {
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
      }

      .date {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        gap: 0.3rem;
        flex-wrap: nowrap;

        img {
          opacity: 0.6;
        }
      }
    }
  }
`;
