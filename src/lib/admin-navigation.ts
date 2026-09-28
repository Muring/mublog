export type PostStatusFilter = "all" | "PUBLISHED" | "DRAFT";
export type PostSort = "newest" | "updated" | "views" | "comments";
/** tag·series 는 값 그대로 비교한다(정확히 같은 것만). 비어 있으면 거르지 않는다 */
export type PostListState = { q: string; status: PostStatusFilter; sort: PostSort; tag: string; series: string };
export function postListState(params: URLSearchParams): PostListState {
    const rawStatus = params.get("status");
    const rawSort = params.get("sort");
    return {
        q: params.get("q") ?? "",
        status: (rawStatus === "PUBLISHED" || rawStatus === "DRAFT" ? rawStatus : "all") as PostStatusFilter,
        sort: (["updated", "views", "comments"].includes(rawSort ?? "") ? rawSort : "newest") as PostSort,
        tag: params.get("tag") ?? "",
        series: params.get("series") ?? "",
    };
}
export function postListUrl(state: PostListState) {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.tag) params.set("tag", state.tag);
    if (state.series) params.set("series", state.series);
    if (state.status !== "all") params.set("status", state.status);
    if (state.sort !== "newest") params.set("sort", state.sort);
    return `/admin${params.size ? `?${params}` : ""}`;
}
export function safeAdminReturn(value?: string | null) {
    if (!value || !/^\/admin(?:\?|$)/.test(value)) return "/admin";
    const url = new URL(value, "https://admin.local");
    return url.pathname === "/admin" ? postListUrl(postListState(url.searchParams)) : "/admin";
}
export type CommentSort = "newest" | "oldest";
/** 댓글 본문 검색어 상한. URL 에 실려 다니고 ILIKE 로 가므로 짧게 묶는다 */
export const COMMENT_QUERY_MAX = 100;
export function commentQuery(value?: string | null) {
    return (value ?? "").trim().slice(0, COMMENT_QUERY_MAX);
}
/** YYYY-MM-DD 로 실재하는 날짜만 받는다. 2026-02-30 처럼 Date 가 조용히 넘겨버리는 값도 걸러낸다 */
export function commentDate(value?: string | null) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}
/** 작성일 범위(from ~ to). 거꾸로 넣었으면 뒤집어 준다 — 오류로 막기보다 뜻이 분명하다 */
export function commentDates(from?: string | null, to?: string | null) {
    const a = commentDate(from), b = commentDate(to);
    return a && b && a > b ? { from: b, to: a } : { from: a, to: b };
}
/**
 * 작성일 범위를 DB 조건으로. 날짜는 **KST** 기준이다 — 서버(Vercel)는 UTC 라 그냥 자르면 아침 9시 전 댓글이 전날로 간다.
 * 종료일은 그날 전체를 포함하도록 다음 날 자정 "미만" 으로 잡는다.
 */
export function commentDateRange(from: string, to: string) {
    return {
        ...(from ? { gte: new Date(`${from}T00:00:00+09:00`) } : {}),
        ...(to ? { lt: new Date(new Date(`${to}T00:00:00+09:00`).getTime() + 86_400_000) } : {}),
    };
}
export function commentListUrl({ post, author, q, from, to, status = "all", sort = "newest", page = 1, returnTo = "/admin" }: {
    post?: string; author?: string; q?: string; from?: string; to?: string; status?: string; sort?: string; page?: number; returnTo?: string;
}) {
    const params = new URLSearchParams();
    const dates = commentDates(from, to);
    if (post) params.set("post", post);
    if (author) params.set("author", author);
    if (commentQuery(q)) params.set("q", commentQuery(q));
    if (dates.from) params.set("from", dates.from);
    if (dates.to) params.set("to", dates.to);
    if (status === "live" || status === "deleted") params.set("status", status);
    if (sort === "oldest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    if (safeAdminReturn(returnTo) !== "/admin") params.set("returnTo", safeAdminReturn(returnTo));
    return `/admin/comments${params.size ? `?${params}` : ""}`;
}
export function commentPage(total: number, requested: number, size = 25) {
    const pages = Math.max(1, Math.ceil(total / size));
    const page = Math.min(pages, Math.max(1, Number.isSafeInteger(requested) ? requested : 1));
    return { page, pages, skip: (page - 1) * size, take: size };
}
/**
 * 페이지 번호 줄. 처음·끝은 늘 두고 현재 앞뒤로 radius 개씩, 끊긴 자리는 null(말줄임).
 * 말줄임이 한 칸만 가리게 되면 그 번호를 그냥 보여준다 — "1 … 3" 보다 "1 2 3" 이 낫다.
 */
export function pageWindow(page: number, pages: number, radius = 2): (number | null)[] {
    const shown = new Set([1, pages]);
    for (let i = page - radius; i <= page + radius; i++) if (i >= 1 && i <= pages) shown.add(i);
    const sorted = [...shown].sort((a, b) => a - b);
    const result: (number | null)[] = [];
    sorted.forEach((n, i) => {
        const prev = sorted[i - 1];
        if (prev !== undefined && n - prev === 2) result.push(n - 1);
        else if (prev !== undefined && n - prev > 2) result.push(null);
        result.push(n);
    });
    return result;
}

type SortablePost = {
    id: string; title: string; slug: string; tags: string[]; status: string;
    publishedAt: string | null; createdAt: string; updatedAt: string;
    viewCount: number; commentCount: number; series?: string | null;
};
export function filterAdminPosts<T extends SortablePost>(posts: T[], state: Omit<PostListState, "tag" | "series"> & Partial<Pick<PostListState, "tag" | "series">>): T[] {
    const query = state.q.trim().toLowerCase();
    return posts.filter((post) => (state.status === "all" || post.status === state.status) &&
        (!state.tag || post.tags.includes(state.tag)) &&
        (!state.series || post.series === state.series) &&
        (!query || [post.title, post.slug, ...post.tags].some((text) => text.toLowerCase().includes(query)))
    ).sort((a, b) => {
        const difference = state.sort === "views" ? b.viewCount - a.viewCount
            : state.sort === "comments" ? b.commentCount - a.commentCount
            : state.sort === "updated" ? Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
            : Date.parse(b.publishedAt ?? b.createdAt) - Date.parse(a.publishedAt ?? a.createdAt);
        return difference || a.id.localeCompare(b.id);
    });
}
