"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ToggleBall, ToggleContainer } from "./ThemeSwitcher.styled";

export default function ThemeSwitcher() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // hydration mismatch 방지
    }, []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";

    return (
        <ToggleContainer
            role="button"
            aria-label="Toggle Dark Mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            isDark={isDark}
        >
            <ToggleBall isDark={isDark} />
        </ToggleContainer>
    );
}
