// SideMenu.tsx
"use client";

import { useState } from "react";
import { ButtonWrapper } from "../Header/Header.styled";
import { MenuWrapper } from "./SideMenu.styled";
import Image from "next/image";

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

            <ul>
                <li>홈</li>
                <li>카테고리</li>
                <li>태그</li>
                <li>소개</li>
            </ul>
        </MenuWrapper>
    );
}
