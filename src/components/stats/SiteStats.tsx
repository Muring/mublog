"use client";

import { useQuery } from "@tanstack/react-query";
import { StatsWrapper } from "./SiteStats.styled";
import { Skeleton } from "@/components/ui/Skeleton.styled";
import { fetchSiteStats, queryKeys } from "@/lib/queries";

/**
 * 사이트 방문자 수.
 *
 * "Today / Total" 처럼 줄이면 무엇을 센 숫자인지 드러나지 않는다.
 * 가로 폭이 있는 자리이므로 문장으로 적어 뜻이 바로 읽히게 한다.
 *
 * 클라이언트에서 가져오므로 홈은 정적 캐시를 유지한다.
 */
export default function SiteStats() {
    const { data } = useQuery({
        // staleTime 은 providers/Query.tsx 의 기본값(60초)을 그대로 쓴다.
        // 한때 0 이었는데, 그러면 방문 비콘(/api/visit)이 응답으로 심어준
        // 갱신값을 받고도 곧바로 다시 받아와 서버리스 호출이 한 번 더 생겼다.
        queryKey: queryKeys.siteStats,
        queryFn: fetchSiteStats,
    });

    // 빈칸으로 두면 없는 것처럼 보이다가 값이 튀어나온다.
    // 실제 줄(141x19)과 같은 크기의 블록을 깔아 "오는 중" 으로 읽히게 한다.
    if (!data) {
        return (
            <StatsWrapper aria-hidden>
                <Skeleton style={{ width: "8.8rem", height: "0.85rem" }} />
            </StatsWrapper>
        );
    }

    return (
        <StatsWrapper>
            {/* JSX 줄바꿈이 공백으로 렌더돼 "4 명" 처럼 벌어지므로 한 조각으로 묶는다 */}
            <span>
                오늘 방문 <strong>{data.today.toLocaleString("ko-KR")}</strong>명
            </span>
            <span className="divider">·</span>
            <span>
                누적 <strong>{data.total.toLocaleString("ko-KR")}</strong>명
            </span>
        </StatsWrapper>
    );
}
