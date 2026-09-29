import type { ManagedImage } from "./storage";

export type ImageFilter = "all" | "thumbnail" | "body" | "unused" | "scheduled";
export type ImageSort = "newest" | "oldest" | "size";
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
