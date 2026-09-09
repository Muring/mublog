import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

/**
 * /sitemap.xml.
 *
 * 이 블로그에는 목록 → 상세로 이어지는 내부 링크가 첫 6개뿐이라
 * 나머지 글은 사실상 여기로만 발견된다. 새 경로를 추가하면 여기에도 넣는다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    /*
     * DB 가 정지돼 있어도 사이트맵 하나 때문에 배포가 깨지지 않게 한다.
     * ([slug]/generateStaticParams 가 빈 배열로 degrade 하는 것과 같은 이유)
     */
    let posts: Awaited<ReturnType<typeof getSitemapEntries>> = [];
    try {
        posts = await getSitemapEntries();
    } catch {
        posts = [];
    }

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    ];

    return [
        ...staticRoutes,
        ...posts.map((post) => ({
            url: `${SITE_URL}/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
