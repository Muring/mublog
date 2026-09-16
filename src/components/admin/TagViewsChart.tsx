"use client";

import { useState } from "react";
import VisitorChart from "./VisitorChart";
import Dropdown from "@/components/ui/Dropdown";
import type { TagDailyViews } from "@/lib/stats";

/**
 * 태그별 조회 추이. VisitorChart 를 그대로 쓰고 태그를 고르는 드롭다운만 얹는다.
 * 계열을 여럿 겹쳐 그리지 않는다 — 태그가 여덟이라 선 여덟 개는 읽을 수 없고, 하나씩 보는 게 낫다.
 */
export default function TagViewsChart({ tags }: { tags: TagDailyViews[] }) {
    const [tag, setTag] = useState(tags[0]?.tag ?? "");
    const current = tags.find((t) => t.tag === tag) ?? tags[0];
    if (!current) return null;

    return (
        <VisitorChart
            title={`태그별 조회 · #${current.tag}`}
            unit="회"
            totalLabel="기록 후"
            points={current.points}
            totalVisitors={current.total}
            controls={
                <Dropdown
                    size="sm"
                    label="태그 선택"
                    value={current.tag}
                    options={tags.map((t) => ({ value: t.tag, label: `#${t.tag} (${t.total})` }))}
                    onChange={setTag}
                />
            }
        />
    );
}
