"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            {children}
        </ThemeProvider>
    );
}
