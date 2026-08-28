import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PostSummary, PostDetail } from "@/types/post";

const SUMMARY_SELECT = {
    id: true,
    slug: true,
    title: true,
    description: true,
    tags: true,
    thumbnail: true,
    publishedAt: true,
    createdAt: true,
    readingTime: true,
    viewCount: true,
    commentCount: true,
} as const;

type SummaryRow = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    tags: string[];
    thumbnail: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    readingTime: number;
    viewCount: number;
    commentCount: number;
};

// 캐시 경계를 넘는 값은 직렬화된다. Date 를 그대로 흘리면 client 컴포넌트까지
// 새어들어가 hydration 불일치의 원인이 되므로 여기서 ISO 문자열로 고정한다.
function toSummary(row: SummaryRow): PostSummary {
    const { createdAt, publishedAt, ...rest } = row;
    return { ...rest, publishedAt: (publishedAt ?? createdAt).toISOString() };
}

/** 발행된 포스트 전체를 최신순으로 */
export const getPublishedPosts = unstable_cache(
    async (): Promise<PostSummary[]> => {
        const rows = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
            select: SUMMARY_SELECT,
        });
        return rows.map(toSummary);
    },
    ["posts-list"],
    { tags: ["posts:list"], revalidate: 3600 }
);

/** generateStaticParams 용 slug 목록 */
export const getPublishedSlugs = unstable_cache(
    async (): Promise<string[]> => {
        const rows = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            select: { slug: true },
        });
        return rows.map((r) => r.slug);
    },
    ["posts-slugs"],
    { tags: ["posts:list"], revalidate: 3600 }
);

/**
 * slug 로 발행 포스트 하나.
 *
 * /[slug] 가 루트 동적 세그먼트라 매칭되지 않은 모든 경로(스캐너의 /wp-admin 등)가
 * 여기로 들어온다. null 도 캐시해야 잘못된 경로마다 DB 를 두드리지 않는다.
 */
export function getPostBySlug(slug: string): Promise<PostDetail | null> {
    return unstable_cache(
        async () => {
            const row = await prisma.post.findFirst({
                where: { slug, status: "PUBLISHED" },
                select: { ...SUMMARY_SELECT, contentHtml: true },
            });
            if (!row) return null;
            const { contentHtml, ...summary } = row;
            return { ...toSummary(summary), contentHtml };
        },
        ["post", slug],
        { tags: ["posts:list", `post:${slug}`], revalidate: 3600 }
    )();
}

/** 태그 목록. "etc" 는 항상 마지막으로 민다. */
export const getAllTags = unstable_cache(
    async (): Promise<string[]> => {
        const rows = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            select: { tags: true },
        });
        return [...new Set(rows.flatMap((r) => r.tags))].sort((a, b) => {
            if (a === "etc") return 1;
            if (b === "etc") return -1;
            return a.localeCompare(b);
        });
    },
    ["posts-tags"],
    { tags: ["posts:list"], revalidate: 3600 }
);

/** 사이드 메뉴의 "Latest posts" / "Recently viewed" 용 */
export const getRecentPosts = unstable_cache(
    async (limit = 5): Promise<PostSummary[]> => {
        const rows = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
            take: limit,
            select: SUMMARY_SELECT,
        });
        return rows.map(toSummary);
    },
    ["posts-recent"],
    { tags: ["posts:list"], revalidate: 3600 }
);
