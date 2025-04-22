import styled from "@emotion/styled";

export const TagWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 3%;
    padding: 1rem;
    animation: fadeIn 1s ease forwards;
    animation-fill-mode: forwards;

    a {
        padding: 0.4rem 0.6rem;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        margin: 0.2rem 0;
    }

    a:hover {
        background-color: var(--hovercolor);
        color: var(--hoverfontcolor);
        transition: 0.1s ease-in-out;
    }

    .active {
        background-color: var(--activecolor) !important;
        color: var(--activefontcolor) !important;
    }
`;
