// SideMenu.tsx
"use client";

import { useState } from "react";
import { ButtonWrapper } from "../Header/Header.styled";
import { MenuWrapper } from "./SideMenu.styled";
import Image from "next/image";
import Link from "next/link";
import SideList from "../SideList/SideList";

export default function SideMenu({ onClose }: { onClose: () => void }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true); // 애니메이션 시작
    };

    const handleAnimationEnd = () => {
        if (isClosing) {
            onClose(); // 애니메이션 끝난 뒤 실제 제거
        }
    };

    return (
        <MenuWrapper isClosing={isClosing} onAnimationEnd={handleAnimationEnd}>
            <div className="side-header">
                <Image
                    src="/icons/mublog.svg"
                    alt="hamburger icon"
                    width={48}
                    height={48}
                    className="main-icon"
                />
                <ButtonWrapper>
                    <button onClick={handleClose} className="menu-button">
                        <Image src="/icons/cancel.svg" alt="cancel icon" width={22} height={22} />
                    </button>
                </ButtonWrapper>
            </div>

            <Link href="/" onClick={handleClose} className="side-menu-link">
                <h5>Post</h5>
            </Link>
            <Link href="/about" onClick={handleClose} className="side-menu-link">
                <h5>About me</h5>
            </Link>

            <SideList title="Latest posts" onLinkClick={handleClose} />
        </MenuWrapper>
    );
}
