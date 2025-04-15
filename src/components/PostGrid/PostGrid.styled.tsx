import styled from "@emotion/styled";

export const PostGridWrapper = styled.div`
    max-width: 1200px;
    min-height: 80vh;
    margin: 0 auto;
    padding: 0 1rem;
`;

export const GridList = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem 0 4rem;

    @media (max-width: 828px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 640px) {
        grid-template-columns: repeat(1, 1fr);
    }
`;
