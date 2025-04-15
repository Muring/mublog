// src/components/Profile.tsx
"use client";

import { RelatedWrapper } from "./RelatedContent.styled";
import Profile from "../Profile/Profile";

export default function RelatedContent() {
    return (
        <RelatedWrapper>
            <Profile />
            <hr />
            {/* TODO: 관련 글 카드 캐러셀 */}
        </RelatedWrapper>
    );
}
