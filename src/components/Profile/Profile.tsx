// src/components/Profile.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ProfileWrapper } from "./Profile.styled";

export default function Profile() {
    return (
        <ProfileWrapper>
            <Image
                src="/icons/mublog.svg"
                alt="hamburger icon"
                width={72}
                height={72}
                className="article-detail-icon"
            />
            <div className="text-container">
                <h3>무링의 개발 블로그</h3>
                <div className="contact">
                    {/* <p>010-2478-2335</p>
                    <p>esh5218@gmail.com</p> */}
                    <Link href={`https://github.com/Muring`}>
                        <Image
                            src="/icons/github.svg"
                            alt="github icon"
                            width={16}
                            height={16}
                            className="article-detail-icon"
                        />
                        Github
                    </Link>
                </div>
            </div>
        </ProfileWrapper>
    );
}
