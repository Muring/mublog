import styled from "@emotion/styled";

export const CardWrapper = styled.article`
    width: 100%;
    border: 1px solid var(--bordercolor);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0px 3px 5px -2px var(--shawdowcolor);
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
        width: 100%;
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
        padding: 1rem;
        background-color: var(--cardbackground);

        .title {
            margin-bottom: 0.6rem;
            color: var(--foreground);
        }

        .description {
            height: 4rem;
            color: gray;
            margin-bottom: 0.8rem;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: gray;

            .tags {
                display: flex;
                align-items: end;
                gap: 0.4rem;

                img {
                    filter: grayscale(100%);
                    opacity: 0.6;
                }
            }

            .date {
                display: flex;
                align-items: center;
                gap: 0.3rem;

                img {
                    opacity: 0.6;
                }
            }
        }
    }
`;
