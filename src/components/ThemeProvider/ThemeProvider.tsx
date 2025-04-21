"use client";

import { useEffect, useState } from "react";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState<boolean | null>(null); // 초기값 null

    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);
    }, []);

    if (isDark === null) return null; // 서버에서 HTML 생성을 피함

    return <div data-theme={isDark ? "dark" : "light"}>{children}</div>;
}
