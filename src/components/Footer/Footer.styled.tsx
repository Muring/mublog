import styled from "@emotion/styled";

export const FooterWrapper = styled.footer`
    background-color: var(--background);
    color: var(--foreground);

    @media (prefers-color-scheme: dark) {
        background-color: var(--background);
        color: var(--foreground);
    }

    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
    border-top: 1px solid var(--bordercolor);
    text-align: center;
    font-size: 0.875rem;
    color: #777;
    gap: 1rem;

    .stack {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
    }
`;
