// src/components/Footer.tsx
"use client";
import { FooterWrapper } from "./Footer.styled";
import Image from "next/image";

export default function Footer() {
    return (
        <FooterWrapper>
            <p>© {new Date().getFullYear()} Mublog. All rights reserved. Developed by MuRing.</p>
            <div className="stack">
                <Image src="/icons/next.svg" alt="next.js icon" width={96} height={48} />
                <Image src="/icons/vercel.svg" alt="vercel icon" width={96} height={28} />
                <Image src="/icons/typescript.svg" alt="typescript icon" width={32} height={32} />
                <Image src="/icons/emotion.svg" alt="emotion icon" width={96} height={48} />
            </div>
        </FooterWrapper>
    );
}
