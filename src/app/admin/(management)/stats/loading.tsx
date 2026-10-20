import AnalyticsSkeleton from "@/components/admin/AnalyticsSkeleton";
import { Skeleton } from "@/components/ui/Skeleton.styled";
import { AnalyticsRoot } from "@/components/admin/Analytics.styled";

/** 첫 진입의 권한 확인 동안만 사용한다. 기간 변경은 기존 결과를 유지하며 로딩 막대로 표시한다. */
export default function AnalyticsLoading() {
    return <AnalyticsRoot className="an-dashboard an-analyticsRoot">
        {/* 실제 기간 카드와 같은 세 조각(위 · 필터 · 아래) */}
        <section className="an-periodCard" aria-hidden>
            <div className="an-periodTop"><Skeleton style={{ width: "250px", maxWidth: "100%", height: "30px" }} /></div>
            <div className="an-periodControls"><Skeleton style={{ width: "308px", maxWidth: "100%", height: "55px" }} /><Skeleton style={{ width: "300px", maxWidth: "100%", height: "36px" }} /></div>
            <div className="an-periodBottom"><div className="an-comparison"><Skeleton style={{ width: "100%", height: "40px" }} /></div></div>
        </section>
        <div className="an-periodResults"><AnalyticsSkeleton /></div>
    </AnalyticsRoot>;
}
