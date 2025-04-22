// Header.tsx
"use client";

import { useEffect, useState } from "react";
import { HeaderWrapper, DiagonalLine, ButtonWrapper } from "./Header.styled";
import Image from "next/image";
import Link from "next/link";
import SideMenu from "../SideMenu/SideMenu";

export default function Header() {
    const [scrollRatio, setScrollRatio] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            const ratio = Math.min(scrollTop / maxScroll, 1);
            setScrollRatio(ratio);
            console.log("scroll: " + ratio);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <HeaderWrapper scrollRatio={scrollRatio}>
            <nav>
                <div className="menu">
                    <ButtonWrapper>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="menu-button auto-dark"
                        >
                            <Image
                                src="/icons/hamburger-menu.svg"
                                alt="hamburger icon"
                                width={22}
                                height={22}
                            />
                        </button>
                    </ButtonWrapper>

                    {menuOpen && <SideMenu onClose={() => setMenuOpen(false)} />}

                    <div className="fast-route-container">
                        <Link href={`/`} className="auto-dark">
                            {" "}
                            <Image
                                src="/icons/mublog.svg"
                                alt="mublog icon"
                                width={24}
                                height={24}
                                className="article-detail-icon"
                            />
                        </Link>
                        <DiagonalLine />
                        <Link href={`https://github.com/Muring`} className="auto-dark">
                            {" "}
                            <Image
                                src="/icons/github.svg"
                                alt="github icon"
                                width={24}
                                height={24}
                                className="article-detail-icon"
                            />
                        </Link>
                    </div>
                </div>
            </nav>
        </HeaderWrapper>
    );
}
