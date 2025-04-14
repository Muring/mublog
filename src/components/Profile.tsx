// src/components/Profile.tsx
"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import Image from "next/image";

export default function Profile() {
    return (
        <Wrapper>
            <Image
                src="/icons/mublog.svg"
                alt="hamburger icon"
                width={72}
                height={72}
                className="article-detail-icon"
            />
            <div className="text-container">
                <h3>무블로그</h3>
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
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 2rem 0;

    .text-container {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        text-align: start;
    }

    .contact {
        font-size: 0.8rem;
        color: #777;
    }

    a {
        display: flex;
        justify-content: baseline;
        align-items: center;
        gap: 0.3rem;
    }
`;
