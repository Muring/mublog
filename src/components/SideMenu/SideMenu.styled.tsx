import styled from "@emotion/styled";

export const MenuWrapper = styled.div<{ isClosing?: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 340px;
    height: 100%;
    background-color: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
    padding: 0.5rem;
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    transition: 0.3s ease-in-out;
    animation: ${({ isClosing }) => (isClosing ? "slideOut" : "slideIn")} 0.3s ease-out forwards;

    @media (max-width: 640px) {
        width: 100% !important;
        border-radius: 0;
        transition: 0.3s ease-in-out;
    }

    a:hover {
        background-color: #f8f8f8;
    }

    .side-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;

        .main-icon {
            margin: 0.5rem 0 0 0.5rem;
        }
    }

    @keyframes slideIn {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-100%);
        }
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
`;
