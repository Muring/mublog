import type { Metadata } from "next";
import Link from "next/link";
import HeaderTitleSetter from "@/components/trackers/HeaderTitleTracker";
import { portfolioProjects, portfolioSkills, PORTFOLIO_PATH } from "@/data/portfolio";
import { baseOpenGraph } from "@/app/shared-metadata";
import ProjectGallery from "./ProjectGallery";
import PortfolioNavigation from "./PortfolioNavigation";
import { GitHubIcon, GlobeIcon, VideoIcon } from "./icons";
import { PortfolioRoot } from "./Portfolio.styled";

const title = "엄세현 포트폴리오";
const description =
    "화면을 만들고, 경험을 연결합니다. 개발자 엄세현의 프로젝트 기록.";
const navigationItems = [
    { id: "portfolio-top", label: "소개" },
    { id: "skills", label: "Skills" },
    {
        id: "projects",
        label: "프로젝트",
        children: portfolioProjects.map(({ id, name }) => ({ id, label: name })),
    },
    { id: "contact", label: "연락처" },
];
const projectNames = new Map(portfolioProjects.map(({ id, name }) => [id, name]));

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: PORTFOLIO_PATH },
    robots: { index: false, follow: false },
    openGraph: {
        ...baseOpenGraph,
        title,
        description,
        type: "website",
        url: PORTFOLIO_PATH,
    },
};

export default function PortfolioPage() {
    return (
        <PortfolioRoot className="pf-page" id="portfolio-top">
            <HeaderTitleSetter title={title} />
            <header className="pf-hero">
                <div className="pf-eyebrow">
                    <span className="pf-dot" /> MURING · PORTFOLIO
                </div>
                <p className="pf-greeting">
                    안녕하세요, 개발자 엄세현입니다.
                </p>
                <h1>
                    화면을 만들고,
                    <br />
                    <span>경험을 연결합니다.</span>
                </h1>
                <p className="pf-intro">
                    사용자가 마주하는 화면부터 그 뒤의 업무 흐름까지.
                    <br className="pf-desktopBreak" /> 웹 프론트엔드와
                    Salesforce를 넘나들며 만든 프로젝트를 소개합니다.
                </p>
                <div className="pf-heroBottom">
                    <span>프론트엔드에서 시작해, 더 넓은 개발 경험으로.</span>
                    <span>SCROLL TO EXPLORE ↓</span>
                </div>
            </header>

            <PortfolioNavigation items={navigationItems} />

            <section
                className="pf-expertise"
                id="skills"
                aria-labelledby="expertise-title"
            >
                <div>
                    <p className="pf-kicker">TECHNICAL SKILLS</p>
                    <h2 id="expertise-title">Skills</h2>
                </div>
                <div className="pf-skills">
                    {portfolioSkills.map((skill) => (
                        <div key={skill.title}>
                            <h3>{skill.title}</h3>
                            <p>{skill.stack}</p>
                            <ul>
                                {skill.highlights.map((highlight) => (
                                    <li key={highlight}>{highlight}</li>
                                ))}
                            </ul>
                            <div className="pf-skillProjects">
                                <span className="pf-skillProjectsLabel">적용 프로젝트</span>
                                {skill.projects.map((id) => (
                                    <a key={id} href={`#${id}`}>{projectNames.get(id)}</a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section
                className="pf-projects"
                id="projects"
                aria-labelledby="projects-title"
            >
                <div className="pf-sectionHeading">
                    <div>
                        <p className="pf-kicker">SELECTED WORK</p>
                        <h2 id="projects-title">
                            프로젝트
                        </h2>
                    </div>
                </div>
                <nav
                    className="pf-projectNav"
                    aria-label="프로젝트 바로가기"
                >
                    {portfolioProjects.map((project, index) => (
                        <a key={project.id} href={`#${project.id}`}>
                            <span>0{index + 1}</span>
                            {project.name}
                            <span aria-hidden="true">↘</span>
                        </a>
                    ))}
                </nav>
                {portfolioProjects.map((project, index) => (
                    <article
                        key={project.id}
                        id={project.id}
                        className="pf-project"
                    >
                        <div className="pf-projectMeta">
                            <span className="pf-projectNumber">
                                0{index + 1}
                            </span>
                            <p className="pf-kicker">{project.category}</p>
                            <h3>{project.name}</h3>
                            <p className="pf-period">{project.period}</p>
                            <dl>
                                <div>
                                    <dt>ROLE</dt>
                                    <dd>{project.role}</dd>
                                </div>
                                <div>
                                    <dt>TEAM</dt>
                                    <dd>{project.team}</dd>
                                </div>
                            </dl>
                            <div className="pf-projectLinks">
                                <a
                                    className="pf-animatedLink"
                                    href={project.repository}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <GitHubIcon />
                                    GitHub / 프로젝트 기록
                                </a>
                                {project.links?.map((link) => (
                                    <a
                                        key={link.url}
                                        className="pf-animatedLink"
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {link.kind === "site" ? (
                                            <GlobeIcon />
                                        ) : (
                                            <VideoIcon />
                                        )}
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="pf-projectBody">
                            <ProjectGallery project={project} />
                            <p className="pf-summary">{project.summary}</p>
                            <h4 className="pf-detailHeading">
                                제가 맡은 일
                            </h4>
                            <ul className="pf-contributions">
                                {project.contributions.map((item, i) => (
                                    <li key={item.title}>
                                        <span aria-hidden="true">0{i + 1}</span>
                                        <div>
                                            <h5>{item.title}</h5>
                                            <p>{item.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <h4 className="pf-stackHeading">사용한 기술</h4>
                            <ul
                                className="pf-tags"
                                aria-label={`${project.name} 기술`}
                            >
                                {project.stack.map((tech) => (
                                    <li key={tech}>{tech}</li>
                                ))}
                            </ul>
                        </div>
                    </article>
                ))}
            </section>
            <section className="pf-contact" id="contact" aria-labelledby="contact-title">
                <p className="pf-kicker">KEEP IN TOUCH</p>
                <h2 id="contact-title">
                    다음 이야기도
                    <br />
                    함께 나누고 싶습니다.
                </h2>
                <a className="pf-email" href="mailto:esh5218@gmail.com">
                    esh5218@gmail.com
                </a>
                <div className="pf-contactActions">
                    <Link href="/" className="pf-button">
                        블로그에서 더 읽기
                    </Link>
                </div>
                <div className="pf-contactBottom">
                    <a href="#portfolio-top">맨 위로 ↑</a>
                </div>
            </section>
        </PortfolioRoot>
    );
}
