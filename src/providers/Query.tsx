"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export default function Query({ children }: { children: ReactNode }) {
    // 모듈 스코프에서 만들면 서버의 동시 요청들이 같은 캐시를 공유한다.
    // 댓글처럼 사용자별 데이터가 생기면 A 의 응답이 B 에게 새어나가므로
    // 컴포넌트 인스턴스마다 하나씩 만든다.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
                },
            })
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
