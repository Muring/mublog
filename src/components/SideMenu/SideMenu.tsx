// SideMenu.tsx
"use client";

import { useEffect, useState } from "react";
import { ButtonWrapper, Overlay } from "../Header/Header.styled";
import { MenuWrapper } from "./SideMenu.styled";
import Image from "next/image";
import Link from "next/link";
import SideList from "../SideList/SideList";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwithcer";

export default function SideMenu({ onClose }: { onClose: () => void }) {
    const [isClosing, setIsClosing] = useState(false);

    // 사이드 메뉴 열렸을 때 body 스크롤 방지
    useEffect(() => {
        const originalBodyStyle = {
            overflow: document.body.style.overflow,
            height: document.body.style.height,
        };
        const originalHtmlStyle = {
            overflow: document.documentElement.style.overflow,
            height: document.documentElement.style.height,
        };

        // 스크롤 완전 차단
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            // 복원
            document.body.style.overflow = originalBodyStyle.overflow;
            document.documentElement.style.overflow = originalHtmlStyle.overflow;
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true); // 애니메이션 시작
    };

    const handleAnimationEnd = () => {
        if (isClosing) {
            onClose(); // 애니메이션 끝난 뒤 실제 제거
        }
    };

    return (
        <>
            <Overlay onClick={handleClose} />
            <MenuWrapper isClosing={isClosing} onAnimationEnd={handleAnimationEnd}>
                <div className="side-header">
                    <Image
                        src="/icons/mublog.svg"
                        alt="hamburger icon"
                        width={48}
                        height={48}
                        className="main-icon auto-dark"
                    />
                    <ButtonWrapper>
                        <button onClick={handleClose} className="menu-button auto-dark">
                            <Image
                                src="/icons/cancel.svg"
                                alt="cancel icon"
                                width={22}
                                height={22}
                            />
                        </button>
                    </ButtonWrapper>
                </div>
                <div className="side-content">
                    <Link href="/" onClick={handleClose} className="side-menu-link">
                        <h5>Post</h5>
                    </Link>
                    <Link href="/about" onClick={handleClose} className="side-menu-link">
                        <h5>About me</h5>
                    </Link>
                    <SideList type="latest" onLinkClick={handleClose} />
                    <SideList type="recent" onLinkClick={handleClose} />
                </div>

                <div className="side-footer">
                    <p>© {new Date().getFullYear()}. MuRing all rights reserved.</p>
                    <ThemeSwitcher />
                </div>
            </MenuWrapper>
        </>
    );
}
