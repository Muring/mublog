"use client";

import { Skeleton, SkeletonText } from "@/components/ui/Skeleton.styled";
import styles from "./Analytics.module.css";

function Line({ width = "100%", height = "0.9rem" }: { width?: string; height?: string }) {
    return <Skeleton style={{ width, height, maxWidth: "100%" }} />;
}

/** 실제 카드·차트·표의 순서와 열 배치를 그대로 유지한다. 기간 선택기는 이 경계 밖에 둔다. */
export default function AnalyticsSkeleton() {
    return <div className={styles.dashboard} role="status" aria-label="통계를 불러오는 중">
        <span className={styles.srOnly}>통계를 불러오는 중…</span>
        <div className={styles.summary} aria-hidden>
            {["기간 방문", "기간 조회"].map(title => <section key={title} className={`${styles.panel} ${styles.summaryCard}`}>
                <div className={styles.summaryMain}><h3><SkeletonText>{title}</SkeletonText></h3><Line width="4ch" height="36px" /></div>
                <div className={styles.summaryAside}><Line /><Line width="80%" /></div>
            </section>)}
        </div>
        <section className={styles.panel} aria-hidden>
            <div className={styles.toolbar}><h3><SkeletonText>방문·조회 추이</SkeletonText></h3><Line width="140px" height="30px" /></div>
            <div className={styles.note}><Line width="70%" /></div>
            <div className={styles.charts}>{["방문", "조회"].map(title => <figure key={title} className={styles.chart}>
                <figcaption><SkeletonText>{title}</SkeletonText></figcaption><Line height="calc(var(--plot-h) + 2.4rem)" /><div className={styles.note}><Line width="80%" /></div>
            </figure>)}</div>
        </section>
        <section className={styles.panel} aria-hidden>
            <div className={styles.toolbar}><h3><SkeletonText>글별 성과</SkeletonText></h3><Line width="230px" height="30px" /></div>
            <div className={styles.note}><Line width="70%" /></div>
            <div className={styles.tableScroll}><table className={`${styles.table} ${styles.performanceTable}`}><thead><tr>{["글", "조회수", "조회 일수"].map(title => <th key={title}><SkeletonText>{title}</SkeletonText></th>)}</tr></thead>
                <tbody>{Array.from({ length: 5 }, (_, i) => <tr key={i}><td><div className={styles.postHeading}><Line width={i % 2 ? "60%" : "70%"} /><Line width="3ch" height="18px" /></div></td>{[0, 1].map(j => <td key={j}><Line /></td>)}</tr>)}</tbody>
            </table></div>
        </section>
        <div className={styles.secondary} aria-hidden>
            <section className={styles.panel}><h3><SkeletonText>태그별 조회</SkeletonText></h3><div className={styles.note}><Line /></div><div className={styles.tags}>{[0, 1, 2, 3].map(i => <div key={i}><Line width="60%" /><div className={styles.note}><Line height="6px" /></div></div>)}</div></section>
            <section className={styles.panel}><h3><SkeletonText>요일별 하루 평균</SkeletonText></h3><div className={styles.note}><Line /></div><div className={styles.tableScroll}><table className={`${styles.table} ${styles.weekday}`}><tbody>{["월", "화", "수", "목", "금", "토", "일"].map(day => <tr key={day}><th><SkeletonText>{day}</SkeletonText></th><td><Line /></td><td><Line /></td></tr>)}</tbody></table></div></section>
        </div>
    </div>;
}
