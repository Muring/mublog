import styled from "@emotion/styled";

export const ProfileWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem 0;

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

    a {
        display: flex;
        justify-content: baseline;
        align-items: center;
        gap: 0.3rem;

        &:hover {
            text-decoration-line: underline;
        }
    }
`;
