"use client";

import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styled from "@emotion/styled";

export default function PostLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    );
}

// const LayoutWrapper = styled.div`
//     display: flex;
//     flex-direction: column;
//     min-height: 100vh;
// `;
