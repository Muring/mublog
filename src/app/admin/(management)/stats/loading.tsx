import AnalyticsSkeleton from "@/components/admin/AnalyticsSkeleton";
import { Skeleton } from "@/components/ui/Skeleton.styled";
import styles from "@/components/admin/Analytics.module.css";

/** 첫 진입의 권한 확인 동안만 사용한다. 기간 변경은 기존 결과를 유지하며 로딩 막대로 표시한다. */
export default function AnalyticsLoading() {
    return <div className={`${styles.dashboard} ${styles.analyticsRoot}`}>
        <section className={styles.panel} aria-hidden>
            <Skeleton style={{ width: "250px", maxWidth: "100%", height: "30px" }} />
            <div className={styles.periodControls}><Skeleton style={{ width: "350px", maxWidth: "100%", height: "55px" }} /><Skeleton style={{ width: "300px", maxWidth: "100%", height: "36px" }} /></div>
            <div className={styles.comparison}><Skeleton style={{ width: "100%", height: "40px" }} /></div>
        </section>
        <AnalyticsSkeleton />
    </div>;
}
