import styled from "@emotion/styled";

export const CardWrapper = styled.article`
    width: 100%;
    border: 1px solid #e6e6e6;
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
        transition: 0.2s ease-in-out;
    }

    .image-wrapper {
        width: 100%;
        min-height: 150px;
        max-height: 15rem;
        overflow: hidden;

        .thumbnail {
            width: 100%;
            height: 100%;
            object-fit: cover;
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
