"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPostViews, queryKeys } from "@/lib/queries";

/**
 * 포스트 조회수.
 *
 * 포스트 페이지는 ISR 로 캐시되므로 서버가 그려준 값은 최대 1시간 전 것이다.
 * 그래서 이 숫자만 클라이언트가 따로 가져온다. 방문 비콘이 응답으로 준
 * 갱신값을 같은 캐시 키에 심어두므로, 보통은 추가 요청 없이 즉시 맞춰진다.
 */
export default function PostViews({ slug, initialViews }: { slug: string; initialViews: number }) {
    const { data } = useQuery({
        queryKey: queryKeys.postViews(slug),
        queryFn: () => fetchPostViews(slug),
        initialData: initialViews,
        staleTime: 0,
    });

    return <>조회 {data.toLocaleString("ko-KR")}</>;
}
