// Header.tsx
"use client";

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import DiagonalLine from "./Diagonalline";

export default function Header() {
    const [scrollRatio, setScrollRatio] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const ratio = Math.min(scrolled / maxScroll, 1);
            setScrollRatio(ratio);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Wrapper scrollRatio={scrollRatio}>
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
        </Wrapper>
    );
}

const Wrapper = styled.header<{ scrollRatio: number }>`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    width: 100%;
    z-index: 50;
    background-color: white;

    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 1280px;
        padding: 0 1rem;
        height: 64px;
        margin: 0 auto;

        .menu {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
            padding: 0.5rem;
        }

        .fast-route-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }

        /* 밑줄 효과 */
        &::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%) scaleX(${({ scrollRatio }) => scrollRatio});
            transform-origin: center;
            width: 100%;
            max-width: 1280px;
            height: 2px;
            background-color: black;
            transition: transform 0.2s ease-out;
            pointer-events: none;
        }
    }

    h1 {
        font-size: 1.25rem;
        font-weight: bold;
    }

    a {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0.5rem;
        width: 3rem;
        height: 3rem;

        &:hover {
            background-color: lightgray;
            transition: 0.1s ease-in-out;
        }
    }
`;
