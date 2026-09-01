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

    // 서버에는 테마가 없으므로 첫 렌더에서는 아무것도 그리지 않는다.
    // next-themes 를 쓸 때의 표준 hydration 가드라 파생값으로 뺄 수 없다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [setTheme]);

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
