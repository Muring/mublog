import styled from "@emotion/styled";

export const ToggleContainer = styled.div<{ isDark: boolean }>`
    width: 48px;
    height: 24px;
    border-radius: 9999px;
    background-color: ${({ isDark }) => "var(--foreground)"};
    display: flex;
    align-items: center;
    padding: 3px;
    cursor: pointer;
    transition: background-color 0.3s ease;
`;

export const ToggleBall = styled.div<{ isDark: boolean }>`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--background);
    transition: transform 0.3s ease;
    transform: ${({ isDark }) => (isDark ? "translateX(24px)" : "translateX(0)")};
`;
