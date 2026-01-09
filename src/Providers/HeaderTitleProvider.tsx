"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type HeaderTitleContextValue = {
    title: string;
    setTitle: (t: string) => void;
};

const HeaderTitleContext = createContext<HeaderTitleContextValue | null>(null);

export function HeaderTitleProvider({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = useState("");

    const value = useMemo(() => ({ title, setTitle }), [title]);

    return <HeaderTitleContext.Provider value={value}>{children}</HeaderTitleContext.Provider>;
}

export function useHeaderTitle() {
    const ctx = useContext(HeaderTitleContext);
    if (!ctx) throw new Error("useHeaderTitle must be used within HeaderTitleProvider");
    return ctx;
}
