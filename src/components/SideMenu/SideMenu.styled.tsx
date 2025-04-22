import styled from "@emotion/styled";

export const MenuWrapper = styled.div<{ isClosing?: boolean }>`
    background-color: var(--background);
    color: var(--foreground);

    display: flex;
    flex-direction: column;
    overflow-y: auto;
    position: fixed;
    top: 0;
    left: 0;
    width: 420px;
    height: 100%;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
    padding: 0 0.5rem;
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    transition: 0.1s ease-in-out;
    animation: ${({ isClosing }) =>
        isClosing
            ? "slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards"
            : "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards"};

    @media (max-width: 640px) {
        width: 100% !important;
        border-radius: 0;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }

    a:hover {
        background-color: var(--hovercolor);
        color: var(--hoverfontcolor);
    }

    .side-header {
        display: flex;
        justify-content: space-between;
        margin: 0.5rem 0 1rem 0;

        .main-icon {
            margin: 0.5rem 0 0 0.5rem;
        }
    }

    .side-content {
        overflow: auto;
    }

    .side-menu-link {
        display: flex;
        justify-content: left;
        align-items: center;
        width: 100%;
        height: 2rem;
        padding: 0 1rem;
        font-weight: bold !important;
    }

    .side-footer {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        bottom: auto;
        padding: 1rem;
        margin-top: auto;
        background-color: var(--background);

        p {
            font-size: 0.7rem;
        }
    }
`;
