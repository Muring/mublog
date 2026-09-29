// Header.tsx
"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HeaderWrapper, DiagonalLine, ButtonWrapper } from "./Header.styled";
import { useHeaderTitle } from "@/providers/HeaderTitleProvider";
import Image from "next/image";
import Link from "next/link";
import SideMenu from "./SideMenu";
import { postsSummaryQuery } from "./SideList";
import HeaderAuth from "./HeaderAuth";
import SearchButton from "@/components/search/SearchButton";

export default function Header() {
    const [scrollRatio, setScrollRatio] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const { title } = useHeaderTitle();
    const queryClient = useQueryClient();
    // 메뉴를 연 뒤에 목록을 부르면 요청 한 번만큼 "불러오는 중" 이 보인다. 버튼에 닿는 순간 받아 둔다
    const prefetchMenu = () => void queryClient.prefetchQuery(postsSummaryQuery);

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
                    <ButtonWrapper>
                        {/* auto-dark 는 아이콘에만 건다. 버튼에 걸면 filter 가 초점 링까지 뒤집어 파랑이 주황으로 보인다 */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            onPointerEnter={prefetchMenu}
                            onFocus={prefetchMenu}
                            className="menu-button"
                        >
                            <Image src="/icons/hamburger-menu.svg" alt="hamburger icon" width={22} height={22} className="auto-dark" />
                        </button>
                    </ButtonWrapper>

                    {menuOpen && <SideMenu onClose={() => setMenuOpen(false)} />}

                    <div className="fast-route-container">
                        <Link href={`/`}>
                            {" "}
                            <Image
                                src="/icons/mublog.svg"
                                alt="mublog icon"
                                width={24}
                                height={24}
                                className="article-detail-icon auto-dark"
                            />
                        </Link>
                        <DiagonalLine />
                        <Link href={`https://github.com/Muring`}>
                            {" "}
                            <Image
                                src="/icons/github.svg"
                                alt="github icon"
                                width={24}
                                height={24}
                                className="article-detail-icon auto-dark"
                            />
                        </Link>
                    </div>
                </div>
                <div className="header-center-title" aria-label="Current post title">
                    <h5>{title}</h5>
                </div>

                <div className="header-right">
                    <SearchButton />
                    <HeaderAuth />
                </div>
            </nav>
        </HeaderWrapper>
    );
}
