/**
 * backup/posts/*.mdx 를 DB 로 이전한다.
 *
 *   yarn migrate:posts --dry-run      결과만 출력하고 쓰지 않음
 *   yarn migrate:posts --only <slug>  특정 글 하나만
 *   yarn migrate:posts                전체 실행
 *
 * slug 유니크 기준 upsert 라 몇 번을 다시 돌려도 안전하다.
 * 렌더링 버그를 고친 뒤 재실행하는 것이 이 작업을 API 라우트가 아니라
 * 스크립트로 만든 이유다.
 */
import { readdirSync, readFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import matter from "gray-matter";

try {
    loadEnvFile(".env");
} catch {
    // 플랫폼이 환경변수를 직접 주입하는 경우
}

const { prisma } = await import("../src/lib/prisma");
const { renderMarkdown } = await import("../src/lib/markdown/render");

const POSTS_DIR = "backup/posts";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyIndex = args.indexOf("--only");
const only = onlyIndex !== -1 ? args[onlyIndex + 1] : null;

/** 한국어 본문 기준 대략 분당 900자 */
function estimateReadingTime(content: string): number {
    return Math.max(1, Math.ceil(content.length / 900));
}

async function main() {
    const files = readdirSync(POSTS_DIR)
        .filter((f) => f.endsWith(".mdx"))
        .filter((f) => !only || f === `${only}.mdx`);

    if (files.length === 0) {
        console.error(only ? `'${only}' 에 해당하는 파일이 없습니다.` : "이전할 파일이 없습니다.");
        process.exit(1);
    }

    console.log(`${files.length}개 파일 ${dryRun ? "검사(dry-run)" : "이전"} 시작\n`);

    for (const file of files) {
        const slug = file.replace(/\.mdx$/, "");
        const { data, content } = matter(readFileSync(`${POSTS_DIR}/${file}`, "utf8"));

        if (!data.title) throw new Error(`${slug}: title 없음`);
        if (!data.date) throw new Error(`${slug}: date 없음`);

        const contentHtml = await renderMarkdown(content);
        const fields = {
            title: data.title as string,
            description: (data.description as string) ?? null,
            tags: (data.tags as string[]) ?? [],
            thumbnail: (data.thumbnail as string) ?? null,
            contentMd: content,
            contentHtml,
            // backup:posts 가 초안에만 붙이는 표시. 없으면 발행글이다.
            status: (data.status === "draft" ? "DRAFT" : "PUBLISHED") as "DRAFT" | "PUBLISHED",
            publishedAt: data.status === "draft" ? null : new Date(data.date),
            readingTime: estimateReadingTime(content),
        };

        if (dryRun) {
            console.log(
                `  ${slug}\n` +
                    `      title  ${fields.title}\n` +
                    `      date   ${fields.publishedAt?.toISOString().slice(0, 10) ?? "(초안)"}\n` +
                    `      tags   ${fields.tags.join(", ") || "-"}\n` +
                    `      html   ${contentHtml.length.toLocaleString()} chars, ${fields.readingTime}분\n`
            );
            continue;
        }

        // authorId 는 여기서 채우지 않는다. 인증(Phase 2)이 아직 없어도
        // 이 마이그레이션이 먼저 돌 수 있어야 하기 때문이다.
        await prisma.post.upsert({
            where: { slug },
            create: { slug, ...fields },
            update: fields,
        });
        console.log(`  ok  ${slug}`);
    }

    if (!dryRun) {
        const total = await prisma.post.count();
        console.log(`\n완료. DB 포스트 수: ${total}`);

        // unstable_cache 는 .next/cache 에 저장되고 재빌드를 넘어 살아남는다.
        // DB 를 바꿔도 revalidate(1시간) 전에는 옛 결과가 계속 나온다.
        console.log(
            [
                "",
                "주의: 이 스크립트는 DB 만 바꾼다. 페이지 캐시는 자동 무효화되지 않는다.",
                "  로컬   : rm -rf .next/cache 후 재빌드",
                "  배포본 : revalidateTag('posts:list') 호출 또는 최대 1시간 대기",
            ].join("\n")
        );
    }
}

await main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
