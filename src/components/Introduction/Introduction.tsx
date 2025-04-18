"use client";

import Link from "next/link";
import { IntroductionWrapper } from "./Introduction.styled";
import Image from "next/image";

export default function Introduction() {
    return (
        <IntroductionWrapper>
            <div className="intro">
                <div className="intro-content">
                    <h5>안녕하세요!</h5>
                    <h5>
                        덕업일치 개발자, <strong>엄세현</strong>
                        입니다.
                    </h5>
                </div>
                <div className="contact-content">
                    <div className="link-content">
                        <h6>Contact.</h6>
                        <Link href={"mailto:esh5218@gmail.com"}>
                            <Image src="/icons/mail.svg" alt="mail icon" width={18} height={18} />
                            <p>Email</p>
                        </Link>
                    </div>
                    <div className="link-content">
                        <h6>Channel.</h6>
                        <div className="link-item">
                            <Link href={`https://muring-blog.vercel.app/`}>
                                <Image
                                    src="/icons/blog.svg"
                                    alt="blog icon"
                                    width={18}
                                    height={18}
                                />
                                <p>Blog</p>
                            </Link>
                            <Link href={`https://github.com/Muring`}>
                                <Image
                                    src="/icons/github.svg"
                                    alt="github icon"
                                    width={18}
                                    height={18}
                                />
                                <p>Github</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <blockquote>
                <p>
                    프론트엔드 개발자로 개발을 시작했으나 현재는 세일즈포스 개발자로 활동하고
                    있습니다. <br />더 나은 사용자 경험에 대한 고민을하고 개발하는 것에서 행복을
                    느낍니다.
                    <br />
                    새로운 도구를 학습하고 연습하는 것도 좋아합니다.
                </p>
            </blockquote>
        </IntroductionWrapper>
    );
}
