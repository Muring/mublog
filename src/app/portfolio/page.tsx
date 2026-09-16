import type { Metadata } from "next";
import Link from "next/link";
import HeaderTitleSetter from "@/components/trackers/HeaderTitleTracker";
import { portfolioProjects, PORTFOLIO_PATH } from "@/data/portfolio";
import { baseOpenGraph } from "@/app/shared-metadata";
import styles from "./portfolio.module.css";
import ProjectGallery from "./ProjectGallery";
import { GitHubIcon, GlobeIcon, VideoIcon } from "./icons";

const title = "엄세현 포트폴리오";
const description =
    "화면을 만들고, 경험을 연결합니다. 개발자 엄세현의 프로젝트 기록.";
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
        <div className={styles.page} id="portfolio-top">
            <HeaderTitleSetter title={title} />
            <header className={styles.hero}>
                <div className={styles.eyebrow}>
                    <span className={styles.dot} /> MURING · PORTFOLIO
                </div>
                <p className={styles.greeting}>
                    안녕하세요, 개발자 엄세현입니다.
                </p>
                <h1>
                    화면을 만들고,
                    <br />
                    <span>경험을 연결합니다.</span>
                </h1>
                <p className={styles.intro}>
                    사용자가 마주하는 화면부터 그 뒤의 업무 흐름까지.
                    <br className={styles.desktopBreak} /> 웹 프론트엔드와
                    Salesforce를 넘나들며 만든 프로젝트를 소개합니다.
                </p>
                <div className={styles.heroBottom}>
                    <span>프론트엔드에서 시작해, 더 넓은 개발 경험으로.</span>
                    <span>SCROLL TO EXPLORE ↓</span>
                </div>
            </header>

            <section
                className={styles.expertise}
                aria-labelledby="expertise-title"
            >
                <div>
                    <p className={styles.kicker}>TECHNICAL SKILLS</p>
                    <h2 id="expertise-title">Skills</h2>
                </div>
                <div className={styles.skills}>
                    <div>
                        <h3>React · Next.js</h3>
                        <p>React · Next.js · Prisma · Supabase · Zustand · PWA</p>
                        <ul>
                            <li>App Router 기반 블로그를 설계·운영하며 DB, 인증, 캐시 무효화까지 직접 다뤘습니다.</li>
                            <li>서비스 화면을 구현하고 API를 연결했으며, PWA를 적용해 설치 가능한 웹앱을 만들었습니다.</li>
                        </ul>
                        <div className={styles.skillProjects}>
                            <span className={styles.skillProjectsLabel}>적용 프로젝트</span>
                            <a href="#mublog">Mublog</a>
                            <a href="#vita">Vita</a>
                        </div>
                    </div>
                    <div>
                        <h3>Vue · Nuxt</h3>
                        <p>Vue 3 · Nuxt 3 · Pinia · Axios</p>
                        <ul>
                            <li>계좌 개설·송금·퀴즈·지도 등 서비스 화면과 재사용 컴포넌트를 구현했습니다.</li>
                            <li>Axios 공통 설정과 API 연동, 비로그인 사용자의 페이지 접근 흐름을 구성했습니다.</li>
                        </ul>
                        <div className={styles.skillProjects}>
                            <span className={styles.skillProjectsLabel}>적용 프로젝트</span>
                            <a href="#momo">MOMO Bank</a>
                            <a href="#seas">SEAS</a>
                            <a href="#ghiburi">집우리</a>
                        </div>
                    </div>
                    <div>
                        <h3>UI · 인터랙션</h3>
                        <p>UI 디자인 · Sass · 캐릭터 애니메이션</p>
                        <ul>
                            <li>서비스 페이지와 캐릭터·배경·아이콘·로고를 디자인했습니다.</li>
                            <li>캐릭터의 걷기·운동 애니메이션을 제작하고 서비스 화면에 적용했습니다.</li>
                        </ul>
                        <div className={styles.skillProjects}>
                            <span className={styles.skillProjectsLabel}>적용 프로젝트</span>
                            <a href="#vita">Vita</a>
                        </div>
                    </div>
                    <div>
                        <h3>Salesforce</h3>
                        <p>LWC · Sales Cloud · Experience Cloud · Flow</p>
                        <ul>
                            <li>LWC로 캐러셀·리드 입력 폼·주문·지도 컴포넌트를 구현했습니다.</li>
                            <li>영업 단계별 필드와 Path를 구성하고, Flow와 Validation Rule로 업무 흐름을 자동화했습니다.</li>
                        </ul>
                        <div className={styles.skillProjects}>
                            <span className={styles.skillProjectsLabel}>적용 프로젝트</span>
                            <a href="#ohana">Ohana Liquor</a>
                        </div>
                    </div>
                </div>
            </section>

            <section
                className={styles.projects}
                id="projects"
                aria-labelledby="projects-title"
            >
                <div className={styles.sectionHeading}>
                    <div>
                        <p className={styles.kicker}>SELECTED WORK</p>
                        <h2 id="projects-title">
                            프로젝트
                        </h2>
                    </div>
                </div>
                <nav
                    className={styles.projectNav}
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
                        className={styles.project}
                    >
                        <div className={styles.projectMeta}>
                            <span className={styles.projectNumber}>
                                0{index + 1}
                            </span>
                            <p className={styles.kicker}>{project.category}</p>
                            <h3>{project.name}</h3>
                            <p className={styles.period}>{project.period}</p>
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
                            <div className={styles.projectLinks}>
                                <a
                                    className={styles.animatedLink}
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
                                        className={styles.animatedLink}
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
                        <div className={styles.projectBody}>
                            <ProjectGallery project={project} />
                            <p className={styles.summary}>{project.summary}</p>
                            <h4 className={styles.detailHeading}>
                                제가 맡은 일
                            </h4>
                            <ul className={styles.contributions}>
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
                            <h4 className={styles.stackHeading}>사용한 기술</h4>
                            <ul
                                className={styles.tags}
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
            <section className={styles.contact} aria-labelledby="contact-title">
                <p className={styles.kicker}>KEEP IN TOUCH</p>
                <h2 id="contact-title">
                    다음 이야기도
                    <br />
                    함께 나누고 싶습니다.
                </h2>
                <a className={styles.email} href="mailto:esh5218@gmail.com">
                    esh5218@gmail.com
                </a>
                <div className={styles.contactActions}>
                    <Link href="/" className={styles.button}>
                        블로그에서 더 읽기
                    </Link>
                </div>
                <div className={styles.contactBottom}>
                    <a href="#portfolio-top">맨 위로 ↑</a>
                </div>
            </section>
        </div>
    );
}
