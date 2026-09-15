"use client";

import Image from "next/image";
import Link from "next/link";
import { contacts, projects, skills } from "@/data/portfolio";
import { ContactList, Divided, Section, SkillGroup, Wrapper } from "./Portfolio.styled";
import PortfolioHero from "./PortfolioHero";
import ProjectItem from "./ProjectItem";

/**
 * 포트폴리오 본문. 순서는 인사 → 프로젝트 → 기술 → 연락처.
 *
 * 프로젝트가 주인공이라 가장 위에 두고, 기술은 프로젝트를 읽은 뒤에
 * "그래서 무엇을 다루는가" 로 정리되도록 아래에 둔다.
 */
export default function Portfolio() {
    return (
        <Wrapper>
            <PortfolioHero />

            <Section id="projects">
                <h2>Projects</h2>
                <p className="intro">
                    취업 전 SSAFY 와 청년 CRM101 에서 팀과 함께 만든 다섯 프로젝트입니다. 네 번은 프론트엔드
                    리더로, 한 번은 개발을 이끄는 PL 로 참여했습니다. 최근 것부터 적었습니다.
                </p>
                <Divided>
                    {projects.map((project, i) => (
                        <ProjectItem key={project.id} project={project} first={i === 0} />
                    ))}
                </Divided>
            </Section>

            <Section id="skills">
                <h2>Skills</h2>
                <Divided>
                    {skills.map((group) => (
                        <SkillGroup key={group.title}>
                            <h3>{group.title}</h3>
                            <ul>
                                {group.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </SkillGroup>
                    ))}
                </Divided>
            </Section>

            <Section id="contact">
                <h2>Contact</h2>
                <ContactList>
                    {contacts.map((contact) => (
                        // dl 의 짝은 감싸지 않는다 — grid 가 dt/dd 를 직접 열에 놓는다
                        <ContactPair key={contact.label} {...contact} />
                    ))}
                </ContactList>
            </Section>
        </Wrapper>
    );
}

function ContactPair({ label, value, href, icon }: (typeof contacts)[number]) {
    const external = href.startsWith("http");
    return (
        <>
            <dt>
                <Image src={icon} alt="" className="auto-dark" width={18} height={18} />
                {label}
            </dt>
            <dd>
                <Link href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {value}
                </Link>
            </dd>
        </>
    );
}
