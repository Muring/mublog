// src/components/Profile.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ProfileWrapper } from "./Profile.styled";

export default function Profile() {
    return (
        <ProfileWrapper>
            <Image src="/icons/mublog.svg" alt="hamburger icon" width={72} height={72} />
            <div className="text-container">
                <h4>무링의 개발 블로그</h4>
                <p>Frontend Developer</p>
            </div>
        </ProfileWrapper>
    );
}
