import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PostSummary, PostDetail } from "@/types/post";
import { compareTags } from "@/lib/tags";

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
    series: true,
    seriesOrder: true,
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
    series: string | null;
    seriesOrder: number | null;
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

/**
 * sitemap.xml 용. slug 와 수정일만 가져온다.
 *
 * `updatedAt` 을 lastModified 로 쓸 수 있는 것은 조회수·댓글 수 증가가 raw SQL 이라
 * `@updatedAt` 을 건드리지 않기 때문이다(stats.ts / comments.ts 주석 참고).
 * 그 둘을 prisma.post.update 로 되돌리면 여기 날짜가 "마지막 조회일" 이 되고,
 * 크롤러는 안 바뀐 글을 계속 다시 읽는다.
 */
export const getSitemapEntries = unstable_cache(
    async (): Promise<{ slug: string; updatedAt: string }[]> => {
        const rows = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
            select: { slug: true, updatedAt: true },
        });
        return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt.toISOString() }));
    },
    ["posts-sitemap"],
    { tags: ["posts:list"], revalidate: 3600 }
);

/** 태그 목록. "etc" 는 항상 마지막으로 민다. */
export const getAllTags = unstable_cache(
    async (): Promise<string[]> => {
        const rows = await prisma.post.findMany({
            where: { status: "PUBLISHED" },
            select: { tags: true },
        });
        return [...new Set(rows.flatMap((r) => r.tags))].sort(compareTags);
    },
    ["posts-tags"],
    { tags: ["posts:list"], revalidate: 3600 }
);

export type SeriesSummary = {
    name: string;
    /** 이 시리즈에 글을 하나 더 넣을 때 받을 순서. 가장 큰 순서 + 1, 순서가 없으면 편수 + 1. */
    nextOrder: number;
};

/** 시리즈 목록. 에디터가 고르고 다음 순서를 채우는 데 쓰므로 초안의 것도 포함한다. */
export const getAllSeries = unstable_cache(
    async (): Promise<SeriesSummary[]> => {
        const rows = await prisma.post.findMany({
            where: { series: { not: null } },
            select: { series: true, seriesOrder: true },
        });
        const map = new Map<string, { count: number; max: number }>();
        for (const row of rows) {
            if (!row.series) continue;
            const entry = map.get(row.series) ?? { count: 0, max: 0 };
            entry.count += 1;
            entry.max = Math.max(entry.max, row.seriesOrder ?? 0);
            map.set(row.series, entry);
        }
        return [...map.entries()]
            .map(([name, { count, max }]) => ({ name, nextOrder: Math.max(max, count) + 1 }))
            .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    },
    ["posts-series"],
    { tags: ["posts:list"], revalidate: 3600 }
);

/**
 * 관리자 목록용. 초안까지 포함하며 캐시하지 않는다.
 * (관리자 화면은 force-dynamic 이라 항상 최신을 봐야 한다)
 */
export async function getAllPostsForAdmin() {
    const rows = await prisma.post.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
            id: true,
            slug: true,
            title: true,
            tags: true,
            status: true,
            publishedAt: true,
            updatedAt: true,
            viewCount: true,
            commentCount: true,
        },
    });
    return rows.map((row) => ({
        ...row,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        /*
         * 여기가 진짜 "고친 날" 인 것은 조회수·댓글 수 증가가 raw SQL 이라
         * @updatedAt 을 건드리지 않기 때문이다 (stats.ts / comments.ts 주석 참고).
         * 그 둘을 prisma.post.update 로 되돌리면 이 열은 조용히 "마지막 조회일" 이 된다.
         */
        updatedAt: row.updatedAt.toISOString(),
    }));
}

/** 에디터에서 불러올 단건. 초안도 조회된다. */
export async function getPostForEdit(id: string) {
    const row = await prisma.post.findUnique({ where: { id } });
    if (!row) return null;
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        tags: row.tags,
        thumbnail: row.thumbnail,
        series: row.series,
        seriesOrder: row.seriesOrder,
        contentMd: row.contentMd,
        status: row.status,
        publishedAt: row.publishedAt?.toISOString() ?? null,
    };
}

export type SearchHit = PostSummary & {
    /** 본문에서 처음 맞은 자리 앞뒤를 잘라낸 한 줄. 제목·요약에서만 맞았으면 null. */
    snippet: string | null;
};

const SEARCH_LIMIT = 20;
const SNIPPET_RADIUS = 60;

/** ILIKE 패턴 문자를 이스케이프한다. 사용자가 % 나 _ 를 치면 그 글자 자체를 찾는다. */
function escapeLike(term: string): string {
    return term.replace(/[\\%_]/g, (c) => "\\" + c);
}

/** 마크다운 원문에서 스니펫에 방해되는 기호만 걷어낸다. 렌더가 아니라 미리보기용이다. */
function plainText(markdown: string): string {
    return markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/[#>*_`|-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * 검색어 전체가 통째로 나오는 자리를 먼저 찾고, 없으면 가장 긴 낱말이 나오는 자리를 쓴다.
 * 짧은 낱말("on")을 먼저 찾으면 "Notion" 같은 엉뚱한 자리가 잡힌다.
 */
function makeSnippet(markdown: string, terms: string[]): string | null {
    const text = plainText(markdown);
    const lower = text.toLowerCase();
    const candidates = [terms.join(" "), ...[...terms].sort((a, b) => b.length - a.length)];
    let at = -1;
    for (const needle of candidates) {
        at = lower.indexOf(needle.toLowerCase());
        if (at !== -1) break;
    }
    if (at === -1) return null;
    const start = Math.max(0, at - SNIPPET_RADIUS);
    const end = Math.min(text.length, at + SNIPPET_RADIUS * 2);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

/**
 * 발행글 검색. 공백으로 나눈 낱말을 전부 포함하는 글을 찾는다.
 *
 * 순서는 목록과 같은 최신순이다. 제목이 맞은 글을 앞으로 당기는 점수 정렬을 써 봤는데,
 * 같은 검색어인데 어떤 글은 앞으로 튀고 어떤 글은 뒤로 가서 무작위처럼 읽혔다.
 * 캐시하지 않는다 — 검색어마다 다르고, 결과가 낡아도 되는 시간이 짧다. 대신 API 쪽에서 CDN 에 잠깐 맡긴다.
 */
export async function searchPosts(query: string): Promise<SearchHit[]> {
    const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 5);
    if (terms.length === 0) return [];

    /*
     * 문장은 손으로 조립하지만 사용자 입력은 전부 $n 자리로만 들어간다.
     * (Prisma.sql 조각을 겹쳐 넣는 방식은 드라이버 어댑터에서 조각이 JSON 으로 직렬화돼
     * "invalid input syntax for type boolean" 으로 죽었다.)
     */
    const haystack = "(title || ' ' || coalesce(description, '') || ' ' || content_md)";
    const params = terms.map((term) => "%" + escapeLike(term) + "%");
    const where = params.map((_, i) => `${haystack} ILIKE $${i + 1}`).join(" AND ");

    const rows = await prisma.$queryRawUnsafe<(SummaryRow & { contentMd: string })[]>(
        `SELECT id, slug, title, description, tags, thumbnail,
                published_at AS "publishedAt", created_at AS "createdAt",
                reading_time AS "readingTime", series, series_order AS "seriesOrder",
                view_count AS "viewCount", comment_count AS "commentCount",
                content_md AS "contentMd"
         FROM posts
         WHERE status = 'PUBLISHED' AND ${where}
         ORDER BY published_at DESC
         LIMIT ${SEARCH_LIMIT}`,
        ...params,
    );

    return rows.map(({ contentMd, ...row }) => ({
        ...toSummary(row),
        snippet: makeSnippet(contentMd, terms),
    }));
}
