// SideMenu.tsx
"use client";

import { useEffect, useState } from "react";
import { ButtonWrapper, Overlay } from "./Header.styled";
import { MenuWrapper } from "./SideMenu.styled";
import Image from "next/image";
import Link from "next/link";
import SideList from "./SideList";
import ThemeSwitcher from "./ThemeSwithcer";

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
            <button onClick={handleClose} className="menu-button" aria-label="메뉴 닫기">
              {/*
                파일로 불러오면 메뉴가 열리는 순간 아직 안 그려져 빈 자리로 보인다.
                메뉴를 닫을 유일한 버튼이라 로딩에 기대지 않고 인라인으로 둔다.
                currentColor 라서 invert 필터(auto-dark) 없이 테마를 따른다.
              */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
