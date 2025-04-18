import styled from "@emotion/styled";

export const CardWrapper = styled.article`
    width: 100%;
    border: 1px solid #e6e6e6;
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0px 3px 5px -2px rgba(0, 0, 0, 0.1);
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

        .title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.4rem;
            color: #111;
        }

        .description {
            height: 4rem;
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.8rem;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: #999;

            .tags {
                display: flex;
                align-items: end;
                gap: 0.4rem;

                img {
                    filter: grayscale(100%);
                    opacity: 0.6;
                }

                span {
                    font-size: 0.75rem;
                    color: #888;
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
