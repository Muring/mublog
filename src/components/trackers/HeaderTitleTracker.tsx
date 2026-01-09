"use client";

import { useEffect } from "react";
import { useHeaderTitle } from "@/Providers/HeaderTitleProvider";

export default function HeaderTitleSetter({ title }: { title: string }) {
    const { setTitle } = useHeaderTitle();

    useEffect(() => {
        setTitle(title);
        return () => setTitle(""); // 페이지 벗어나면 초기화
    }, [title, setTitle]);

    return null;
}
