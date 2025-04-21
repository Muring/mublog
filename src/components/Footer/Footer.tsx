// src/components/Footer.tsx
"use client";
import { FooterWrapper } from "./Footer.styled";
import Image from "next/image";

export default function Footer() {
    return (
        <FooterWrapper>
            <p>© {new Date().getFullYear()} Mublog. All rights reserved. Developed by MuRing.</p>
            <div className="stack">
                <Image
                    src="/icons/next.svg"
                    className="auto-dark"
                    alt="next.js icon"
                    width={96}
                    height={48}
                />
                <Image
                    src="/icons/vercel.svg"
                    className="auto-dark"
                    alt="vercel icon"
                    width={96}
                    height={26}
                />
                <Image
                    src="/icons/typescript.svg"
                    className="auto-dark"
                    alt="typescript icon"
                    width={30}
                    height={30}
                />
                <Image src="/icons/emotion.svg" alt="emotion icon" width={96} height={46} />
            </div>
        </FooterWrapper>
    );
}
