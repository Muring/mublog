// SideMenu.tsx
"use client";

import { useState } from "react";
import { ButtonWrapper } from "../Header/Header.styled";
import { MenuWrapper } from "./SideMenu.styled";
import { allPosts } from "contentlayer/generated";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import SidePost from "../SidePost/SidePost";

export default function SideMenu({ onClose }: { onClose: () => void }) {
    const [isClosing, setIsClosing] = useState(false);

    const latestPosts = allPosts
        .slice() // 원본 변경 방지
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
        .slice(0, 5);

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

            <Link href={"/"} onClick={handleClose} className="side-menu-link">
                Post
            </Link>
            <Link href={"/about"} onClick={handleClose} className="side-menu-link">
                About me
            </Link>

            <div className="latest-post-container">
                <div className="latest-post-title">
                    Lastest post
                    <hr />
                </div>
                <div className="latest-post-content">
                    {latestPosts.map((post) => (
                        <Link key={post._id} href={`/${post.slug}`} className="side-link">
                            <SidePost
                                title={post.title}
                                desc={post.description}
                                thumbnail={post.thumbnail}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </MenuWrapper>
    );
}
