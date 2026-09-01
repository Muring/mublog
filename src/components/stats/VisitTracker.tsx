"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { postViewsKey } from "@/components/post/PostViews";

/** 포스트 상세 경로에서만 slug 를 뽑는다. /about 같은 정적 경로는 제외. */
const RESERVED = new Set(["", "about", "login", "admin", "auth", "api"]);

function postSlugFrom(pathname: string): string | null {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length !== 1) return null;
    const slug = segments[0];
    if (RESERVED.has(slug)) return null;
    return /^[a-z0-9-]{1,120}$/.test(slug) ? slug : null;
}

/**
 * 방문 집계 비콘. 화면에 아무것도 그리지 않는다.
 *
 * 하이드레이션 이후에 호출하므로 렌더 경로에 전혀 영향을 주지 않는다.
 * keepalive 를 붙여 사용자가 곧바로 페이지를 떠나도 요청이 살아남게 한다.
 */
export default function VisitTracker() {
    const pathname = usePathname();
    const queryClient = useQueryClient();
    // 같은 경로에서 중복 전송을 막는다.
    // 개발 모드의 StrictMode 이중 실행도 함께 걸러진다.
    const lastSent = useRef<string | null>(null);

    useEffect(() => {
        if (lastSent.current === pathname) return;
        lastSent.current = pathname;

        const slug = postSlugFrom(pathname);

        void fetch("/api/visit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
            keepalive: true,
        })
            .then(async (res) => {
                if (!res.ok) return;
                // 응답에 담겨온 갱신값으로 화면을 맞춘다.
                // 페이지는 ISR 캐시라 서버가 그려준 값이 오래됐을 수 있고,
                // 여기서 심어두면 추가 요청 없이 바로 반영된다.
                const data = await res.json().catch(() => null);
                if (slug && typeof data?.views === "number") {
                    queryClient.setQueryData(postViewsKey(slug), data.views);
                }
                if (data?.stats) {
                    // 먼저 진행 중인 /api/stats 요청을 끊는다. 그쪽은 60초 캐시라
                    // 방문이 반영되기 전의 값을 들고 있을 수 있는데, 그게 나중에
                    // 도착하면 방금 올린 숫자를 도로 내려버린다.
                    await queryClient.cancelQueries({ queryKey: ["site-stats"] });
                    queryClient.setQueryData(["site-stats"], data.stats);
                }
            })
            .catch(() => {
                // 집계 실패가 사용자에게 보일 이유는 없다
            });
    }, [pathname, queryClient]);

    return null;
}
