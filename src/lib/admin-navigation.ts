import { withinAdminDates } from "./admin-filters";
import { appendMultiParam, readMultiParam, splitMulti } from "./multi-value";
import type { ImageQuery } from "./admin-image-query";

export type PostStatusFilter = "all" | "PUBLISHED" | "DRAFT";
export type PostSort = "newest" | "updated" | "views" | "comments";
/**
 * tag·series 는 여러 개를 고를 수 있다(lib/multi-value 로 이은 문자열). 고른 것 중 하나와 정확히 같으면 남긴다.
 * 비어 있으면 거르지 않는다. 주소창에는 ?tag=a&tag=b 로 싣는다.
 */
export type PostListState = { q: string; status: PostStatusFilter; sort: PostSort; tag: string; series: string; from?: string; to?: string; hasComments?: "" | "yes" | "no" };
export function postListState(params: URLSearchParams): PostListState {
    const rawStatus = params.get("status");
    const rawSort = params.get("sort");
    return {
        ...commentDates(params.get("from"), params.get("to")),
        hasComments: params.get("hasComments") === "yes" ? "yes" : params.get("hasComments") === "no" ? "no" : "",
        q: params.get("q") ?? "",
        status: (rawStatus === "PUBLISHED" || rawStatus === "DRAFT" ? rawStatus : "all") as PostStatusFilter,
        sort: (["updated", "views", "comments"].includes(rawSort ?? "") ? rawSort : "newest") as PostSort,
        tag: readMultiParam(params, "tag"),
        series: readMultiParam(params, "series"),
    };
}
export function postListUrl(state: PostListState) {
    const params = new URLSearchParams();
    const dates = commentDates(state.from, state.to);
    if (dates.from) params.set("from", dates.from);
    if (dates.to) params.set("to", dates.to);
    if (state.hasComments) params.set("hasComments", state.hasComments);
    if (state.q) params.set("q", state.q);
    appendMultiParam(params, "tag", state.tag);
    appendMultiParam(params, "series", state.series);
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
    appendMultiParam(params, "post", post);
    appendMultiParam(params, "author", author);
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
        (!state.tag || splitMulti(state.tag).some((tag) => post.tags.includes(tag))) &&
        (!state.series || splitMulti(state.series).includes(post.series ?? "")) &&
        withinAdminDates(post.createdAt, state.from, state.to) &&
        (!state.hasComments || (state.hasComments === "yes" ? post.commentCount > 0 : post.commentCount === 0)) &&
        (!query || [post.title, post.slug, ...post.tags].some((text) => text.toLowerCase().includes(query)))
    ).sort((a, b) => {
        const difference = state.sort === "views" ? b.viewCount - a.viewCount
            : state.sort === "comments" ? b.commentCount - a.commentCount
            : state.sort === "updated" ? Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
            : Date.parse(b.publishedAt ?? b.createdAt) - Date.parse(a.publishedAt ?? a.createdAt);
        return difference || a.id.localeCompare(b.id);
    });
}

/*
 * 관리 화면의 보기 상태(탭·필터·정렬·검색)는 화면 상태가 아니라 주소에 둔다. 새로고침·뒤로 가기·링크로 열어도
 * 보던 화면 그대로다. 포스트(postListUrl)·댓글(commentListUrl)·이미지·AI 관리가 같은 규칙을 따른다.
 * - 기본값은 주소에서 뺀다. 다중 선택은 같은 이름을 반복한다(?post=a&post=b).
 * - 화면 안에서 바꿀 때는 replaceListUrl 로 기록을 쌓지 않고 주소만 바꾼다. useSearchParams 가 바뀐 값을 다시 읽는다.
 * - 모르는 값은 기본값으로 읽는다. 손으로 고친 주소나 옛 주소가 화면을 깨뜨리지 않게 한다.
 */
export type ListField = { fallback: string; multi?: boolean; date?: boolean; allowed?: readonly string[] };
export type ListState<F extends Record<string, ListField>> = { [K in keyof F]: string };
export function readListState<F extends Record<string, ListField>>(params: URLSearchParams, fields: F): ListState<F> {
    const state = {} as ListState<F>;
    for (const key of Object.keys(fields) as (keyof F & string)[]) {
        const field = fields[key];
        const value = field.multi ? readMultiParam(params, key) : params.get(key) ?? "";
        const valid = field.date ? commentDate(value) === value : !field.allowed || field.allowed.includes(value);
        state[key] = value && valid ? value : field.fallback;
    }
    return state;
}
export function listStateUrl<F extends Record<string, ListField>>(pathname: string, state: ListState<F>, fields: F) {
    const params = new URLSearchParams();
    for (const key of Object.keys(fields) as (keyof F & string)[]) {
        const value = state[key];
        if (!value || value === fields[key].fallback) continue;
        if (fields[key].multi) appendMultiParam(params, key, value);
        else params.set(key, value);
    }
    return `${pathname}${params.size ? `?${params}` : ""}`;
}
/** 기록을 쌓지 않고 주소만 바꾼다. 필터를 고칠 때마다 뒤로 가기 기록이 늘지 않게 한다 */
export function replaceListUrl(url: string) {
    window.history.replaceState(null, "", url);
}

/*
 * 관리 탭(포스트·댓글·이미지·통계)마다 마지막으로 보던 주소를 기억한다. 다른 탭에 갔다 돌아와도 조건이 남는다.
 * 브라우저 탭 하나 안에서만 쓰는 편의라 sessionStorage 에 둔다. 막혀 있으면(사생활 보호 모드 등) 기본 주소로 간다.
 */
const LIST_MEMORY = "admin-list-url:";
export function rememberListUrl(pathname: string, url: string) {
    try { sessionStorage.setItem(LIST_MEMORY + pathname, url); } catch { /* 기억 못 하면 기본 주소로 간다 */ }
}
export function rememberedListUrl(pathname: string): string | null {
    try { return sessionStorage.getItem(LIST_MEMORY + pathname); } catch { return null; }
}

/** 이미지 관리(/admin/images). 주소의 status 는 화면의 쓰임 필터(ImageQuery.filter)다 — 포스트·댓글과 이름을 맞춘다 */
export const IMAGE_LIST_FIELDS = {
    status: { fallback: "all", allowed: ["all", "thumbnail", "body", "unused", "scheduled"] },
    sort: { fallback: "newest", allowed: ["newest", "oldest", "size"] },
    q: { fallback: "" },
    post: { fallback: "", multi: true },
    from: { fallback: "", date: true },
    to: { fallback: "", date: true },
    format: { fallback: "", multi: true },
    size: { fallback: "", allowed: ["small", "medium", "large"] },
} satisfies Record<string, ListField>;
/** 주소의 이미지 목록 상태를 API 조회 조건으로. 키 순서를 DEFAULT_IMAGE_QUERY 와 맞춰야 같은 조건이 같은 문자열이 된다 */
export function imageQueryOf(state: ListState<typeof IMAGE_LIST_FIELDS>): ImageQuery {
    const { from, to } = commentDates(state.from, state.to);
    return {
        filter: state.status as ImageQuery["filter"], sort: state.sort as ImageQuery["sort"], q: state.q, post: state.post,
        from, to, format: state.format, size: state.size,
    };
}

/** AI 관리(/ai/manage). 사용량 조건(project…effort)과 작업 기록 조건(task…)은 탭마다 따로 남는다 */
export const AI_TABS = [["usage", "사용량"], ["quality", "작업 기록"], ["status", "수집 상태"]] as const;
export type AiTab = typeof AI_TABS[number][0];
export const AI_VIEW_FIELDS = {
    tab: { fallback: "usage", allowed: AI_TABS.map(([key]) => key) },
    period: { fallback: "8", allowed: ["4", "8", "12", "year"] },
    view: { fallback: "groups", allowed: ["groups", "weeks"] },
    year: { fallback: "" },
    sort: { fallback: "newest", allowed: ["newest", "oldest"] },
    q: { fallback: "" },
    project: { fallback: "", multi: true },
    tool: { fallback: "", multi: true },
    model: { fallback: "", multi: true },
    effort: { fallback: "", multi: true },
    taskProject: { fallback: "", multi: true },
    taskType: { fallback: "", multi: true },
    taskStatus: { fallback: "", multi: true },
} satisfies Record<string, ListField>;
