// SideMenu.tsx
"use client";

import { ButtonWrapper, Overlay } from "./Header.styled";
import { MenuWrapper } from "./SideMenu.styled";
import Image from "next/image";
import Link from "next/link";
import SideList from "./SideList";
import ThemeSwitcher from "./ThemeSwitcher";
import { useExitTransition, useScrollLock } from "@/hooks/useOverlay";

export default function SideMenu({ onClose }: { onClose: () => void }) {
  // 밀려 들어오고 나가는 움직임·움직임 줄이기·닫힘 안전망·뒤 스크롤 잠금은 다른 창들과 같은 공용 동작이다
  const { closing, requestClose: handleClose, onAnimationEnd } = useExitTransition(onClose);
  useScrollLock();

  return (
    <>
      <Overlay onClick={handleClose} data-closing={closing || undefined} />
      <MenuWrapper data-closing={closing || undefined} onAnimationEnd={onAnimationEnd}>
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
