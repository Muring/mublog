"use client";

import { Button } from "@/components/admin/Admin.styled";
import styles from "@/components/admin/Analytics.module.css";

export default function AnalyticsError({ reset }: { reset: () => void }) {
    return <section className={styles.panel} role="alert"><h3>통계를 불러오지 못했습니다.</h3>
        <p className={styles.note}>잠시 후 다시 시도해 주세요.</p><Button type="button" onClick={reset}>다시 시도</Button>
    </section>;
}
