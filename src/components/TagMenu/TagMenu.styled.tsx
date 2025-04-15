import styled from "@emotion/styled";

export const TagWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 1rem;

    a {
        padding: 0.3rem 0.6rem;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
    }

    a:hover {
        background-color: #f8f8f8;
        transition: 0.1s ease-in-out;
    }

    .active {
        background-color: black !important;
        color: white !important;
    }
`;
