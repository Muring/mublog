"use client";

import { Button } from "@/components/admin/Admin.styled";
import { AnalyticsRoot } from "@/components/admin/Analytics.styled";

export default function AnalyticsError({ reset }: { reset: () => void }) {
    return <AnalyticsRoot as="section" className="an-panel" role="alert"><h3>통계를 불러오지 못했습니다.</h3>
        <p className="an-note">잠시 후 다시 시도해 주세요.</p><Button type="button" onClick={reset}>다시 시도</Button>
    </AnalyticsRoot>;
}
