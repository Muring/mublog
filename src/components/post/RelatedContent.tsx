"use client";

import { RelatedWrapper } from "./RelatedContent.styled";
import Profile from "@/components/Profile";

/**
 * 본문 아래 작성자 소개.
 *
 * 한때 여기에 "관련 글 캐러셀" TODO 가 있었으나, 같은 페이지 아래쪽에서
 * CarouselSlider 가 이미 그 일을 한다(app/[slug]/page.tsx).
 */
export default function RelatedContent() {
  return (
    <RelatedWrapper>
      <Profile />
      <hr />
    </RelatedWrapper>
  );
}
