// src/providers/Theme.tsx

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export default function Theme({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    );
}
