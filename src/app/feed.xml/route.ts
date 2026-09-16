import { getPublishedPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { SITE_DESCRIPTION, SITE_NAME } from "@/app/shared-metadata";

export const revalidate = 3600;

const FEED_SIZE = 30;

/** XML 텍스트 노드·속성에 넣기 전에 다섯 글자를 이스케이프한다. */
function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * /feed.xml — RSS 2.0.
 *
 * sitemap.ts 와 같은 방식이다: 캐시된 목록을 받아 문자열로 조립하고 1시간 ISR.
 * 본문은 넣지 않는다 — 요약만 주고 링크로 보낸다. 본문까지 주면 피드가 글 30편의
 * HTML 을 통째로 들고 다니고, 조회수도 안 잡힌다.
 */
export async function GET() {
    // DB 가 정지돼 있어도 피드 하나 때문에 배포가 깨지지 않게 한다 (sitemap 과 같은 이유)
    let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
    try {
        posts = await getPublishedPosts();
    } catch {
        posts = [];
    }

    const items = posts
        .slice(0, FEED_SIZE)
        .map((post) => {
            const url = `${SITE_URL}/${post.slug}`;
            const categories = post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("");
            return `<item>
<title>${escapeXml(post.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
${post.description ? `<description>${escapeXml(post.description)}</description>` : ""}
${categories}
</item>`;
        })
        .join("\n");

    const lastBuild = posts[0] ? new Date(posts[0].publishedAt).toUTCString() : new Date().toUTCString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(SITE_NAME)}</title>
<link>${SITE_URL}</link>
<description>${escapeXml(SITE_DESCRIPTION)}</description>
<language>ko</language>
<lastBuildDate>${lastBuild}</lastBuildDate>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}
