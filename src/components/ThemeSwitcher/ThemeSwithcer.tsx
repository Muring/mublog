"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ToggleBall, ToggleContainer, ToggleLabel } from "./ThemeSwitcher.styled";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // localStorage 값 없으면 강제 system 설정
        const stored = localStorage.getItem("theme");
        if (!stored) {
            setTheme("system");
        }

        setMounted(true); // hydration mismatch 방지
    }, []);

    if (!mounted) return null;

    const nextTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    return (
        <ToggleContainer themeMode={theme} onClick={nextTheme}>
            <ToggleBall themeMode={theme} />
            {theme === "system" && <ToggleLabel>System</ToggleLabel>}
        </ToggleContainer>
    );
}
