// components/DiagonalLine.tsx
import styled from "@emotion/styled";

const DiagonalLine = styled.div`
    height: 28px; // Tailwind의 h-7 (1.75rem)
    width: 1px; // Tailwind의 w-px (1px)
    background-color: #d4d4d8; // Tailwind의 bg-zinc-300
    transform: rotate(30deg); // Tailwind의 rotate-[30deg]

    @media (prefers-color-scheme: dark) {
        background-color: #3f3f46; // Tailwind의 dark:bg-zinc-700
    }
`;

export default DiagonalLine;
