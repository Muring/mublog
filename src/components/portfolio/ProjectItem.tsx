"use client";

import Image from "next/image";
import type { Project } from "@/data/portfolio";
import P from "./ProjectItem.styled";
import ShotCarousel from "./ShotCarousel";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function ProjectItem({ project, first = false }: { project: Project; first?: boolean }) {
    const repo = project.links.find((link) => link.label === "GitHub");
    const others = project.links.filter((link) => link !== repo);

    return (
        <P.Item id={project.id} aria-labelledby={`${project.id}-title`}>
            <P.Title>
                <h3 id={`${project.id}-title`}>{project.name}</h3>
                {repo && (
                    <a href={repo.href} {...external} aria-label={`${project.name} GitHub 저장소`}>
                        <Image src="/icons/github.svg" alt="" className="auto-dark" width={24} height={24} />
                    </a>
                )}
            </P.Title>

            <P.Summary>
                <P.Facts>
                    <div>
                        <dt>기간</dt>
                        <dd>
                            {project.period} · {project.scale}
                        </dd>
                    </div>
                    <div>
                        <dt>역할</dt>
                        <dd>{project.role}</dd>
                    </div>
                    <div>
                        <dt>과정</dt>
                        <dd>{project.program}</dd>
                    </div>
                </P.Facts>
                <P.Description>
                    <p className="tagline">{project.tagline}</p>
                    {project.description.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </P.Description>
            </P.Summary>

            <ShotCarousel shots={project.shots} label={`${project.name} 화면`} priority={first} />

            <P.Details>
                <div>
                    <h4>What did I do?</h4>
                    <ul className="did">
                        {project.contributions.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4>Tech Stack</h4>
                    <P.Stack>
                        {project.stack.map((tech) => (
                            <li key={tech}>{tech}</li>
                        ))}
                    </P.Stack>
                    {/* 시연 영상 같은 링크는 기술 스택 아래 같은 열에 둔다 */}
                    {others.length > 0 && (
                        <>
                            <h4>Links</h4>
                            <P.Links>
                                {others.map((link) => (
                                    <a key={link.href} href={link.href} {...external}>
                                        {link.label} ↗
                                    </a>
                                ))}
                            </P.Links>
                        </>
                    )}
                </div>
            </P.Details>
        </P.Item>
    );
}
