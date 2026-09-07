/**
 * 임의 위치의 mdx 파일 하나를 DB 에 초안(DRAFT)으로 등록한다.
 *
 *   yarn draft:post <파일경로>            등록
 *   yarn draft:post <파일경로> --dry-run  검사만
 *
 * migrate:posts 와 달리 upsert 가 아니라 create 다. slug 가 이미 있으면 실패한다.
 * 다른 프로젝트에서 /blog-draft 로 만든 초안을 넣는 통로라, 남의 글을 조용히
 * 덮어쓰는 일이 절대 없어야 하기 때문이다.
 *
 * backup/posts 에는 쓰지 않는다. 등록 후 `yarn backup:posts` 가 DB 를 보고
 * 정규 형식으로 내보내므로, 두 곳에서 형식을 만들면 매번 diff 가 난다.
 */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { loadEnvFile } from "node:process";
import matter from "gray-matter";

try {
    loadEnvFile(".env");
} catch {
    // 플랫폼이 환경변수를 직접 주입하는 경우
}

const { prisma } = await import("../src/lib/prisma");
const { renderMarkdown } = await import("../src/lib/markdown/render");
const { estimateReadingTime } = await import("../src/lib/reading-time");
const { slugSchema } = await import("../src/lib/validation");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const file = args.find((a) => !a.startsWith("--"));

if (!file) {
    console.error("사용법: yarn draft:post <파일경로> [--dry-run]");
    process.exit(1);
}

async function main(path: string) {
    const { data, content } = matter(readFileSync(path, "utf8"));
    const body = content.trim();

    const parsed = slugSchema.safeParse((data.slug as string) ?? basename(path).replace(/\.mdx?$/, ""));
    if (!parsed.success) throw new Error(`slug: ${parsed.error.issues[0].message}`);
    const slug = parsed.data;
    if (!data.title) throw new Error("프론트매터에 title 이 없습니다.");
    if (!body) throw new Error("본문이 비어 있습니다.");

    const tags = (data.tags as string[]) ?? [];
    const fields = {
        slug,
        title: data.title as string,
        description: (data.description as string) ?? null,
        tags,
        thumbnail: (data.thumbnail as string) ?? null,
        contentMd: body,
        contentHtml: await renderMarkdown(body),
        // 초안이므로 publishedAt 은 비운다. 발행 시점에 에디터가 채운다.
        status: "DRAFT" as const,
        readingTime: estimateReadingTime(body),
    };

    const existing = await prisma.post.findUnique({
        where: { slug },
        select: { status: true },
    });
    if (existing) {
        throw new Error(
            `slug '${slug}' 는 이미 있습니다(${existing.status}). 다른 slug 를 쓰거나 에디터에서 고치세요.`
        );
    }

    console.log(
        `  slug   ${slug}\n` +
            `  title  ${fields.title}\n` +
            `  tags   ${tags.join(", ") || "-"}\n` +
            `  본문   ${body.length.toLocaleString()}자, ${fields.readingTime}분\n`
    );

    if (dryRun) {
        console.log("dry-run 이라 쓰지 않았습니다.");
        return;
    }

    const post = await prisma.post.create({ data: fields, select: { id: true } });
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    console.log(`초안 등록 완료.  ${site}/admin/posts/${post.id}`);
    console.log("백업에 반영하려면 mublog 에서 `yarn backup:posts` 후 커밋하세요.");
}

await main(file)
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
