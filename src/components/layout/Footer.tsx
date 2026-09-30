// src/components/Footer.tsx
"use client";
import { FooterWrapper } from "./Footer.styled";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <FooterWrapper>
      <p>© {new Date().getFullYear()} Mublog. All rights reserved. Developed by MuRing.</p>
      {/*
        크롤러가 따라갈 수 있는 유일한 /about 링크다. SideMenu 의 "About me" 는
        메뉴를 열어야 마운트되는 클라이언트 컴포넌트라 서버 HTML 에 나오지 않는다.
      */}
      <nav className="links" aria-label="사이트 정보">
        <Link href="/about">소개</Link>
        <span aria-hidden="true">·</span>
        <Link href="/ai">AI 활용</Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacy">개인정보 처리방침</Link>
      </nav>
      <div className="stack">
        <Image
          src="/icons/next.svg"
          className="auto-dark"
          alt="next.js icon"
          width={96}
          height={48}
        />
        <Image
          src="/icons/vercel.svg"
          className="auto-dark"
          alt="vercel icon"
          width={96}
          height={26}
        />
        <Image
          src="/icons/typescript.svg"
          className="auto-dark"
          alt="typescript icon"
          width={30}
          height={30}
        />
        <Image src="/icons/emotion.svg" alt="emotion icon" width={96} height={46} />
      </div>
    </FooterWrapper>
  );
}
