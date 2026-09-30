import type { Metadata } from "next";
import Link from "next/link";
import { getPublicAi } from "@/lib/ai-usage-data";
import { DEFAULT_AI_INTRO } from "@/lib/ai-usage";
import SentenceText from "@/components/ai/SentenceText";
import AiIntroTitle from "@/components/ai/AiIntroTitle";
import AiUsageView from "@/components/ai/AiUsageView";
import styles from "@/components/ai/AiDashboard.module.css";
export const metadata: Metadata = { title: "AI 활용", description: "AI를 어떻게 사용하고 검증하며, 지식과 사용 기록으로 개선하는지 소개합니다.", alternates: { canonical: "/ai" } };
export const dynamic = "force-dynamic";
export default async function AiPage() {
    let data: Awaited<ReturnType<typeof getPublicAi>> | null = null;
    try { data = await getPublicAi(); } catch { /* The explanatory page remains readable during a database outage. */ }
    const intro = data?.entries.find(e => e.kind === "intro");
    return <div className={styles.page}>
        <header className={styles.hero}><span className={styles.eyebrow}>WORKING WITH AI</span><h1><AiIntroTitle title={intro?.title ?? DEFAULT_AI_INTRO.title} /></h1><p className={styles.prose}><SentenceText>{intro?.body ?? DEFAULT_AI_INTRO.body}</SentenceText></p></header>
        <section className={`${styles.grid} ${styles.process}`} aria-label="AI 활용 과정">{[["01 · 작업", "목표와 제약을 정하고 AI와 구현합니다."], ["02 · 검증", "실행한 검사와 확인하지 못한 부분을 구분합니다."], ["03 · 지식", "재사용할 결과와 선호를 KB 후보로 모아 검토합니다."], ["04 · 개선", "모델·추론 수준과 필요한 검증을 유지하며 반복 작업을 줄입니다."]].map(([title, body]) => <div className={styles.card} key={title}><h2>{title}</h2><p className={styles.note}>{body}</p></div>)}</section>
        {!data && <p className={styles.warning}>지금은 집계를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>}
        <AiUsageView years={data?.years ?? []} asOf={new Date().toISOString()} />
        <section className={styles.section}><div className={styles.sectionHeading}><h2>개선 기록과 관련 글</h2><p className={styles.note}>무엇을 바꿨고 어떤 차이가 있었는지, 직접 확인한 내용을 남깁니다.</p></div><ol className={styles.timeline}>{data?.entries.filter(e => e.kind === "improvement").map(e => <li className={styles.card} key={e.id}><time className={styles.note}>{e.date}</time><h3>{e.title}</h3><p className={styles.prose}><SentenceText>{e.body}</SentenceText></p>{e.post && <Link className={styles.link} href={`/${e.post.slug}`}>{e.post.title} →</Link>}</li>)}</ol>{!data?.entries.some(e => e.kind === "improvement") && <p className={styles.emptyState}><SentenceText>첫 개선 기록을 준비하고 있습니다. 확인한 변화와 남은 과제를 함께 공유하겠습니다.</SentenceText></p>}</section>
    </div>;
}
