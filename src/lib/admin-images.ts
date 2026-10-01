import { z } from "zod";
import { prisma } from "./prisma";
import { collectImageUsage, describeImages, nextSweepAt, GRACE_HOURS } from "./storage";
import { commentDate } from "./admin-navigation";
import { DEFAULT_IMAGE_QUERY, type ImagePage, type ImageQuery } from "./admin-image-query";

export const IMAGE_PAGE_SIZE = 24;
export class ImageQueryError extends Error {}
const date = z.string().refine(value => !value || commentDate(value) === value);
const querySchema = z.object({
    filter: z.enum(["all", "thumbnail", "body", "unused", "scheduled"]).default("all"),
    sort: z.enum(["newest", "oldest", "size"]).default("newest"),
    // post·format 은 여러 개를 고를 수 있다. lib/multi-value 의 구분자(chr(31))로 이어 온다
    q: z.string().max(300).default(""), post: z.string().max(2000).default(""),
    from: date.default(""), to: date.default(""), format: z.string().max(200).default(""),
    size: z.enum(["", "small", "medium", "large"]).default(""),
}).refine(value => !value.from || !value.to || value.from <= value.to);
const cursorSchema = z.object({
    path: z.string().min(1).max(1024), size: z.number().nonnegative().finite(),
    createdAt: z.string().datetime({ offset: true }), at: z.string().datetime(), query: z.string().max(6000),
});
export function parseImageQuery(params: URLSearchParams): ImageQuery {
    const parsed = querySchema.safeParse(Object.fromEntries(params));
    if (!parsed.success) throw new ImageQueryError("이미지 필터 값이 올바르지 않습니다.");
    return parsed.data;
}
function readCursor(encoded: string | undefined, query: ImageQuery) {
    if (!encoded) return null;
    try {
        if (encoded.length > 8000) throw new Error();
        const value = cursorSchema.parse(JSON.parse(Buffer.from(encoded, "base64url").toString()));
        if (value.query !== JSON.stringify(query)) throw new Error();
        return value;
    } catch { throw new ImageQueryError("목록 위치가 올바르지 않습니다. 다시 불러와 주세요."); }
}

// SQL 문장은 고정 문자열만 합친다. 모든 사용자 값과 참조 정보는 $n 매개변수로 전달한다.
// Prisma 드라이버의 중첩 SQL 조각 문제를 피하려고 queryRawUnsafe의 바인딩을 사용한다.
const SCOPE_SQL = `WITH settings AS (SELECT $2::jsonb AS q),
refs AS (SELECT key AS path, value AS usage FROM jsonb_each($1::jsonb)),
objects AS MATERIALIZED (
    SELECT o.name AS path, coalesce((o.metadata->>'size')::bigint, 0)::float8 AS size,
        coalesce(o.created_at, $3::timestamptz) AS created_at,
        coalesce(r.usage->'thumbnail', '[]'::jsonb) AS thumbnail,
        coalesce(r.usage->'body', '[]'::jsonb) AS body,
        CASE WHEN o.name ~ '\\.[^./]*$' THEN
            CASE WHEN lower(substring(o.name from '\\.([^./]*)$')) = 'jpg' THEN 'jpeg'
                 ELSE lower(substring(o.name from '\\.([^./]*)$')) END ELSE '' END AS format,
        CASE WHEN r.path IS NOT NULL THEN 'used'
             WHEN coalesce(o.created_at, $3::timestamptz) > $3::timestamptz - ($4::int * interval '1 hour')
             THEN 'grace' ELSE 'scheduled' END AS state
    FROM storage.objects o LEFT JOIN refs r ON r.path = o.name
    WHERE o.bucket_id = 'post-images'
),
users AS (
    SELECT DISTINCT u->>'id' AS id, u->>'slug' AS slug, u->>'title' AS title
    FROM objects o CROSS JOIN LATERAL jsonb_array_elements(o.thumbnail || o.body) u
),
scoped AS MATERIALIZED (
    SELECT o.* FROM objects o CROSS JOIN settings s
    WHERE (s.q->>'post' = '' OR EXISTS (
        SELECT 1 FROM users u WHERE u.id = ANY(string_to_array(s.q->>'post', chr(31))) AND (
            (o.thumbnail || o.body) @> jsonb_build_array(jsonb_build_object('id', u.id)) OR
            (split_part(o.path, '/', 1) IN ('posts', 'thumbnails') AND split_part(o.path, '/', 2) = u.slug)
        )
    ))
    AND (s.q->>'q' = '' OR strpos(lower(o.path), lower(s.q->>'q')) > 0 OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(o.thumbnail || o.body) u
        WHERE strpos(lower(u->>'title'), lower(s.q->>'q')) > 0 OR strpos(lower(u->>'slug'), lower(s.q->>'q')) > 0
    ))
    AND (s.q->>'from' = '' OR o.created_at >= (nullif(s.q->>'from', '') || 'T00:00:00+09:00')::timestamptz)
    AND (s.q->>'to' = '' OR o.created_at < (nullif(s.q->>'to', '') || 'T00:00:00+09:00')::timestamptz + interval '1 day')
    AND (s.q->>'format' = '' OR o.format = ANY(string_to_array(s.q->>'format', chr(31))))
    AND CASE s.q->>'size' WHEN 'small' THEN o.size < 102400
        WHEN 'medium' THEN o.size >= 102400 AND o.size < 1048576
        WHEN 'large' THEN o.size >= 1048576 ELSE true END
)`;
const PAGE_SQL = `,
selected AS MATERIALIZED (
    SELECT o.* FROM scoped o CROSS JOIN settings s
    WHERE CASE s.q->>'filter'
        WHEN 'thumbnail' THEN jsonb_array_length(o.thumbnail) > 0
        WHEN 'body' THEN jsonb_array_length(o.body) > 0
        WHEN 'unused' THEN o.state <> 'used'
        WHEN 'scheduled' THEN o.state = 'scheduled' ELSE true END
),
page AS (
    SELECT o.path, o.size, o.created_at AS "createdAt" FROM selected o CROSS JOIN settings s
    WHERE $5::jsonb IS NULL OR CASE s.q->>'sort'
        WHEN 'size' THEN o.size < ($5::jsonb->>'size')::float8 OR
            (o.size = ($5::jsonb->>'size')::float8 AND o.path COLLATE "C" > ($5::jsonb->>'path') COLLATE "C")
        WHEN 'oldest' THEN o.created_at > ($5::jsonb->>'createdAt')::timestamptz OR
            (o.created_at = ($5::jsonb->>'createdAt')::timestamptz AND o.path COLLATE "C" > ($5::jsonb->>'path') COLLATE "C")
        ELSE o.created_at < ($5::jsonb->>'createdAt')::timestamptz OR
            (o.created_at = ($5::jsonb->>'createdAt')::timestamptz AND o.path COLLATE "C" > ($5::jsonb->>'path') COLLATE "C") END
    ORDER BY CASE WHEN s.q->>'sort' = 'size' THEN o.size END DESC,
        CASE WHEN s.q->>'sort' = 'oldest' THEN o.created_at END ASC,
        CASE WHEN s.q->>'sort' = 'newest' THEN o.created_at END DESC, o.path COLLATE "C" ASC
    LIMIT $6::int
),
post_counts AS (
    SELECT u.id, u.slug, u.title, count(*)::int AS count FROM users u JOIN objects o ON
        (o.thumbnail || o.body) @> jsonb_build_array(jsonb_build_object('id', u.id)) OR
        (split_part(o.path, '/', 1) IN ('posts', 'thumbnails') AND split_part(o.path, '/', 2) = u.slug)
    GROUP BY u.id, u.slug, u.title
)
SELECT jsonb_build_object(
    'rows', coalesce((SELECT jsonb_agg(page) FROM page), '[]'::jsonb),
    'count', (SELECT count(*) FROM selected), 'bytes', (SELECT coalesce(sum(size),0) FROM selected),
    'totalCount', (SELECT count(*) FROM objects), 'totalBytes', (SELECT coalesce(sum(size),0) FROM objects),
    'counts', (SELECT jsonb_build_object('all', count(*),
        'thumbnail', count(*) FILTER (WHERE jsonb_array_length(thumbnail)>0),
        'body', count(*) FILTER (WHERE jsonb_array_length(body)>0),
        'unused', count(*) FILTER (WHERE state <> 'used'),
        'scheduled', count(*) FILTER (WHERE state = 'scheduled')) FROM scoped),
    'scheduledCount', (SELECT count(*) FROM scoped WHERE state = 'scheduled'),
    'scheduledBytes', (SELECT coalesce(sum(size),0) FROM scoped WHERE state = 'scheduled'),
    'posts', coalesce((SELECT jsonb_agg(post_counts) FROM post_counts),'[]'::jsonb),
    'formats', coalesce((SELECT jsonb_agg(format ORDER BY format) FROM (SELECT DISTINCT format FROM objects WHERE format <> '') f),'[]'::jsonb)
) AS data`;

type RawPage = Omit<ImagePage, "images" | "nextCursor" | "nextSweepAt"> & {
    rows: { path: string; size: number; createdAt: string }[];
};
export async function getImagePage(query: ImageQuery = DEFAULT_IMAGE_QUERY, encodedCursor?: string): Promise<ImagePage> {
    const cursor = readCursor(encodedCursor, query);
    const now = cursor ? new Date(cursor.at) : new Date();
    const usage = await collectImageUsage();
    const [result] = await prisma.$queryRawUnsafe<{ data: RawPage }[]>(SCOPE_SQL + PAGE_SQL,
        JSON.stringify(Object.fromEntries(usage)), JSON.stringify({ ...query, q: query.q.trim() }), now,
        GRACE_HOURS, cursor ? JSON.stringify(cursor) : null, IMAGE_PAGE_SIZE + 1);
    const { rows, ...summary } = result.data;
    const page = rows.slice(0, IMAGE_PAGE_SIZE);
    const last = page.at(-1);
    return {
        ...summary,
        posts: summary.posts.sort((a,b) => a.title.localeCompare(b.title, "ko", { numeric: true })),
        images: describeImages(page.map(row => ({ ...row, createdAt: new Date(row.createdAt) })), usage, now),
        nextCursor: rows.length > IMAGE_PAGE_SIZE && last ? Buffer.from(JSON.stringify({
            ...last, at: now.toISOString(), query: JSON.stringify(query),
        })).toString("base64url") : null,
        nextSweepAt: nextSweepAt(now).toISOString(),
    };
}
export async function getScheduledImageTargets(query: ImageQuery): Promise<{ path: string; size: number }[]> {
    const usage = await collectImageUsage();
    return prisma.$queryRawUnsafe(SCOPE_SQL + " SELECT path, size FROM scoped WHERE state = 'scheduled' ORDER BY path",
        JSON.stringify(Object.fromEntries(usage)), JSON.stringify({ ...query, q: query.q.trim() }), new Date(), GRACE_HOURS);
}
