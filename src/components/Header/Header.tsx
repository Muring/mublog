// Header.tsx
"use client";

import { useEffect, useState } from "react";
import { HeaderWrapper, DiagonalLine } from "./Header.styled";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    const [scrollRatio, setScrollRatio] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            const ratio = Math.min(scrollTop / maxScroll, 1);
            setScrollRatio(ratio);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <HeaderWrapper scrollRatio={scrollRatio}>
            <nav>
                <div className="menu">
                    <Link href={`/`}>
                        <Image
                            src="/icons/hamburger-menu.svg"
                            alt="hamburger icon"
                            width={24}
                            height={24}
                            className="article-detail-icon"
                        />
                    </Link>

                    <div className="fast-route-container">
                        <Link href={`/`}>
                            {" "}
                            <Image
                                src="/icons/mublog.svg"
                                alt="mublog icon"
                                width={32}
                                height={32}
                                className="article-detail-icon"
                            />
                        </Link>
                        <DiagonalLine />
                        <Link href={`https://github.com/Muring`}>
                            {" "}
                            <Image
                                src="/icons/github.svg"
                                alt="github icon"
                                width={32}
                                height={32}
                                className="article-detail-icon"
                            />
                        </Link>
                    </div>
                </div>
            </nav>
        </HeaderWrapper>
    );
}
