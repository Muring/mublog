export type PostStatusFilter = "all" | "PUBLISHED" | "DRAFT";
export type PostSort = "newest" | "updated" | "views" | "comments";
export function postListState(params: URLSearchParams) {
    const rawStatus = params.get("status");
    const rawSort = params.get("sort");
    return {
        q: params.get("q") ?? "",
        status: (rawStatus === "PUBLISHED" || rawStatus === "DRAFT" ? rawStatus : "all") as PostStatusFilter,
        sort: (["updated", "views", "comments"].includes(rawSort ?? "") ? rawSort : "newest") as PostSort,
    };
}
export function postListUrl(state: ReturnType<typeof postListState>) {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.status !== "all") params.set("status", state.status);
    if (state.sort !== "newest") params.set("sort", state.sort);
    return `/admin${params.size ? `?${params}` : ""}`;
}
export function safeAdminReturn(value?: string | null) {
    if (!value || !/^\/admin(?:\?|$)/.test(value)) return "/admin";
    const url = new URL(value, "https://admin.local");
    return url.pathname === "/admin" ? postListUrl(postListState(url.searchParams)) : "/admin";
}
export function commentListUrl({ post, author, status = "all", page = 1, returnTo = "/admin" }: {
    post?: string; author?: string; status?: string; page?: number; returnTo?: string;
}) {
    const params = new URLSearchParams();
    if (post) params.set("post", post);
    if (author) params.set("author", author);
    if (status === "live" || status === "deleted") params.set("status", status);
    if (page > 1) params.set("page", String(page));
    if (safeAdminReturn(returnTo) !== "/admin") params.set("returnTo", safeAdminReturn(returnTo));
    return `/admin/comments${params.size ? `?${params}` : ""}`;
}
export function commentPage(total: number, requested: number, size = 25) {
    const pages = Math.max(1, Math.ceil(total / size));
    const page = Math.min(pages, Math.max(1, Number.isSafeInteger(requested) ? requested : 1));
    return { page, pages, skip: (page - 1) * size, take: size };
}

type SortablePost = {
    id: string; title: string; slug: string; tags: string[]; status: string;
    publishedAt: string | null; createdAt: string; updatedAt: string;
    viewCount: number; commentCount: number;
};
export function filterAdminPosts<T extends SortablePost>(posts: T[], state: ReturnType<typeof postListState>): T[] {
    const query = state.q.trim().toLowerCase();
    return posts.filter((post) => (state.status === "all" || post.status === state.status) &&
        (!query || [post.title, post.slug, ...post.tags].some((text) => text.toLowerCase().includes(query)))
    ).sort((a, b) => {
        const difference = state.sort === "views" ? b.viewCount - a.viewCount
            : state.sort === "comments" ? b.commentCount - a.commentCount
            : state.sort === "updated" ? Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
            : Date.parse(b.publishedAt ?? b.createdAt) - Date.parse(a.publishedAt ?? a.createdAt);
        return difference || a.id.localeCompare(b.id);
    });
}
