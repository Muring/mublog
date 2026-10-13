import type { ManagedImage } from "./storage";

/* 허용값은 여기 한 곳에 둔다. 주소 검사(IMAGE_LIST_FIELDS)와 API 검사(admin-images 의 스키마)가 같이 읽는다 */
export const IMAGE_FILTERS = ["all", "thumbnail", "body", "unused", "scheduled"] as const;
export const IMAGE_SORTS = ["newest", "oldest", "size"] as const;
/** 용량 구간. 비어 있으면 거르지 않는다 */
export const IMAGE_SIZE_KEYS = ["small", "medium", "large"] as const;
export type ImageFilter = typeof IMAGE_FILTERS[number];
export type ImageSort = typeof IMAGE_SORTS[number];
export type ImageQuery = {
    filter: ImageFilter; sort: ImageSort; q: string; post: string;
    from: string; to: string; format: string; size: string;
};
export const DEFAULT_IMAGE_QUERY: ImageQuery = {
    filter: "all", sort: "newest", q: "", post: "", from: "", to: "", format: "", size: "",
};
export type ImagePage = {
    images: ManagedImage[];
    nextCursor: string | null;
    count: number;
    bytes: number;
    totalBytes: number;
    totalCount: number;
    counts: Record<ImageFilter, number>;
    scheduledCount: number;
    scheduledBytes: number;
    posts: { id: string; slug: string; title: string; count: number }[];
    formats: string[];
    nextSweepAt: string;
};
export function imagePageUrl(query: ImageQuery, cursor?: string, targets = false) {
    const params = new URLSearchParams(query);
    if (cursor) params.set("cursor", cursor);
    if (targets) params.set("targets", "scheduled");
    return `/api/admin/images/list?${params}`;
}
