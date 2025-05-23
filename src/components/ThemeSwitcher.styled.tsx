import styled from "@emotion/styled";

export const ToggleContainer = styled.div<{ themeMode: string | undefined }>`
  width: 48px;
  height: 24px;
  border-radius: 9999px;
  background-color: var(--foreground);
  display: flex;
  align-items: center;
  justify-content: ${({ themeMode }) =>
    themeMode === "light" ? "flex-start" : themeMode === "dark" ? "flex-end" : "center"};
  padding: 3px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease;
`;

export const ToggleBall = styled.div<{ themeMode: string | undefined }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--background);
  opacity: ${({ themeMode }) => (themeMode === "system" ? 0.3 : 1)};
  transition: transform 0.3s ease, opacity 0.3s ease;
`;

export const ToggleLabel = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--background);
  pointer-events: none;
`;
