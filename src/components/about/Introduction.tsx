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
            방랑하는 개발자, <strong>엄세현</strong>
            입니다.
          </h5>
        </div>
        <div className="contact-content">
          <div className="link-content">
            <h6>Contact.</h6>
            <Link href={"mailto:esh5218@gmail.com"}>
              <Image
                src="/icons/mail.svg"
                alt="mail icon"
                className="auto-dark"
                width={18}
                height={18}
              />
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
                  className="auto-dark"
                  width={18}
                  height={18}
                />
                <p>Blog</p>
              </Link>
              <Link href={`https://github.com/Muring`}>
                <Image
                  src="/icons/github.svg"
                  alt="github icon"
                  className="auto-dark"
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
          <strong>
            React·Next.js와 Salesforce로, 사용자 경험과 업무 흐름을 함께 설계하는 개발자
          </strong>
        </p>
        <p>
          화면 설계부터 API 연동과 업무 자동화까지, 사용자가 일을 마치는 흐름을 고민합니다.
          <br />
          직접 만든 서비스를 운영하며 작은 불편을 꾸준히 개선하고 있습니다.
        </p>
      </blockquote>
    </IntroductionWrapper>
  );
}
