import type { Metadata } from "next";
import { getPublicAi } from "@/lib/ai-usage-data";
import { getPublishedPosts } from "@/lib/posts";
import CarouselSlider from "@/components/post/CarouselSlider";
import type { PostSummary } from "@/types/post";
import { AI_POST_SERIES, DEFAULT_AI_INTRO } from "@/lib/ai-usage";
import ParagraphText from "@/components/ai/ParagraphText";
import Info from "@/components/ai/Info";
import AiIntroTitle from "@/components/ai/AiIntroTitle";
import AiUsageView from "@/components/ai/AiUsageView";
import styles from "@/components/ai/AiDashboard.module.css";
export const metadata: Metadata = { title: "AI 활용", description: "AI를 어떻게 사용하고 검증하며, 지식과 사용 기록으로 개선하는지 소개합니다.", alternates: { canonical: "/ai" } };
export const dynamic = "force-dynamic";
export default async function AiPage() {
    // Each source fails on its own: the explanatory page stays readable during a database outage.
    const [usage, list] = await Promise.allSettled([getPublicAi(), getPublishedPosts()]);
    const data = usage.status === "fulfilled" ? usage.value : null;
    const posts: PostSummary[] = list.status === "fulfilled" ? list.value : [];
    const related = posts.filter(p => p.series && AI_POST_SERIES.includes(p.series));
    const intro = data?.intro;
    return <div className={styles.page}>
        <header className={styles.hero}><span className={styles.eyebrow}>WORKING WITH AI</span><h1><AiIntroTitle title={intro?.title ?? DEFAULT_AI_INTRO.title} /></h1><p className={styles.prose}><ParagraphText>{intro?.body ?? DEFAULT_AI_INTRO.body}</ParagraphText></p></header>
        <section className={`${styles.grid} ${styles.process}`} aria-label="AI 활용 과정">{[["01 · 작업", "목표와 제약을 정하고 AI와 구현합니다."], ["02 · 검증", "실행한 검사와 확인하지 못한 부분을 구분합니다."], ["03 · 지식", "재사용할 결과와 선호를 KB 후보로 모아 검토합니다."], ["04 · 개선", "모델·추론 수준과 필요한 검증을 유지하며 반복 작업을 줄입니다."]].map(([title, body]) => <div className={styles.card} key={title}><h2>{title}</h2><p className={styles.note}>{body}</p></div>)}</section>
        {!data && <p className={styles.warning}>지금은 집계를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>}
        <AiUsageView years={data?.years ?? []} asOf={new Date().toISOString()} />
        <section className={styles.section}><div className={styles.sectionHeading}><div className={styles.titleRow}><h2>관련 글</h2><Info>{AI_POST_SERIES.join(", ")} 시리즈에서 AI 작업 방식을 바꾸고 직접 확인한 과정을 모았습니다.</Info></div></div>
            {related.length ? <CarouselSlider className={styles.relatedSlider} posts={related} currentSlug="" heading={null} /> : <p className={styles.emptyState}>아직 발행된 관련 글이 없습니다.</p>}
        </section>
    </div>;
}
