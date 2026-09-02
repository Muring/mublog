import { fetchJson } from "@/lib/fetcher";
import type { PostSummary } from "@/types/post";
import type { CommentNode } from "@/types/comment";

/**
 * 클라이언트에서 쓰는 쿼리 키와 페처.
 *
 * 키를 컴포넌트마다 문자열로 적으면 같은 데이터를 두 이름으로 부르게 된다.
 * 실제로 ["me"] 와 ["site-stats"] 가 각각 두 파일에 흩어져 있었다.
 *
 * 더 큰 이유는 의존 방향이다. 이 값들이 컴포넌트 파일에 얹혀 있어서
 * stats/VisitTracker 가 post/PostViews 를, comments/Comments 가
 * layout/HeaderAuth 를 import 하고 있었다. 기능 폴더가 서로의 UI 를 끌어다
 * 쓰는 모양인데, 실제로 필요한 것은 UI 가 아니라 데이터 계약이었다.
 * 그 계약을 여기로 옮기면 그 화살표가 사라진다.
 *
 * staleTime 은 여기서 정하지 않는다. providers/Query.tsx 의 기본값(60초)을
 * 따르고, 그와 달라야 하는 곳에서만 호출부가 직접 지정한다.
 */

export type Me = {
    user: { id: string; username: string; avatarUrl: string | null } | null;
    isAdmin: boolean;
};

export type SiteStats = { today: number; total: number };

export const queryKeys = {
    me: ["me"] as const,
    siteStats: ["site-stats"] as const,
    postsSummary: ["posts", "summary"] as const,
    postViews: (slug: string) => ["post-views", slug] as const,
    comments: (slug: string) => ["comments", slug] as const,
};

/** 현재 로그인 상태. 헤더와 댓글 영역이 함께 본다. */
export function fetchMe(): Promise<Me> {
    return fetchJson<Me>("/api/me");
}

/** 사이트 방문 집계 */
export function fetchSiteStats(): Promise<SiteStats> {
    return fetchJson<SiteStats>("/api/stats");
}

/** 사이드 메뉴의 목록. 서버에서 이미 최신순으로 정렬돼 온다. */
export function fetchPostsSummary(): Promise<PostSummary[]> {
    return fetchJson<PostSummary[]>("/api/posts/summary");
}

/** 포스트 조회수. 페이지는 ISR 이라 이 숫자만 따로 받는다. */
export async function fetchPostViews(slug: string): Promise<number> {
    const data = await fetchJson<{ views: number | null }>(
        `/api/posts/${encodeURIComponent(slug)}/views`
    );
    return data.views ?? 0;
}

/** 한 포스트의 댓글. 서버는 평평한 배열을 주고 화면에서 2단으로 묶는다. */
export function fetchComments(slug: string): Promise<CommentNode[]> {
    return fetchJson<CommentNode[]>(commentsUrl(slug));
}

/** 댓글 작성 대상 주소. 생성 mutation 도 같은 주소를 쓴다. */
export function commentsUrl(slug: string): string {
    return `/api/posts/${encodeURIComponent(slug)}/comments`;
}
