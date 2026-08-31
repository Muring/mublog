/**
 * DB 의 포스트를 src/contents/posts/*.mdx 로 내보낸다.
 *
 *   yarn backup:posts             내보내기
 *   yarn backup:posts --dry-run   무엇이 바뀔지만 출력
 *
 * Supabase 무료 플랜에는 자동 백업이 없다. 이 스크립트로 내보낸 뒤 커밋해두면
 * git 이 실질적인 백업이자 버전 이력이 된다.
 *
 * migrate-posts 와 정확히 반대 방향이며 프론트매터 형식이 같아서 왕복이 성립한다.
 * (DB 가 날아가도 backup -> migrate:posts 로 복구할 수 있다)
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

try {
    loadEnvFile(".env");
} catch {
    // 플랫폼이 환경변수를 직접 주입하는 경우
}

const { prisma } = await import("../src/lib/prisma");
const { seoulDateKey } = await import("../src/lib/date");

const POSTS_DIR = "src/contents/posts";
const dryRun = process.argv.includes("--dry-run");

/** YAML 이중따옴표 스칼라. JSON 문자열은 그대로 유효하므로 이스케이프를 맡긴다. */
const quote = (value: string) => JSON.stringify(value);

/** 단순한 태그는 따옴표 없이, 특수문자가 있으면 감싼다 */
const yamlTag = (tag: string) => (/^[A-Za-z0-9가-힣_-]+$/.test(tag) ? tag : quote(tag));

type PostRow = {
    slug: string;
    title: string;
    description: string | null;
    tags: string[];
    thumbnail: string | null;
    contentMd: string;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: Date | null;
    createdAt: Date;
};

function toMdx(post: PostRow): string {
    const lines = [
        "---",
        `title: ${quote(post.title)}`,
        // 날짜는 반드시 KST 로 자른다. UTC 로 자르면 하루씩 밀린다.
        `date: ${quote(seoulDateKey(post.publishedAt ?? post.createdAt))}`,
    ];

    if (post.description) lines.push(`description: ${quote(post.description)}`);

    if (post.tags.length > 0) {
        lines.push("tags:");
        for (const tag of post.tags) lines.push(`    - ${yamlTag(tag)}`);
    }

    if (post.thumbnail) lines.push(`thumbnail: ${quote(post.thumbnail)}`);
    // 발행글에는 넣지 않는다. 원래 형식 그대로 유지하기 위해서다.
    if (post.status === "DRAFT") lines.push("status: draft");

    lines.push("---");

    // 프론트매터 뒤에는 관례대로 빈 줄을 둔다.
    // 본문 앞뒤 공백은 정리해 매번 같은 결과가 나오게 한다.
    return lines.join("\n") + "\n\n" + post.contentMd.trim() + "\n";
}

async function main() {
    if (!existsSync(POSTS_DIR)) mkdirSync(POSTS_DIR, { recursive: true });

    const posts = (await prisma.post.findMany({
        orderBy: { slug: "asc" },
        select: {
            slug: true,
            title: true,
            description: true,
            tags: true,
            thumbnail: true,
            contentMd: true,
            status: true,
            publishedAt: true,
            createdAt: true,
        },
    })) as PostRow[];

    const existing = new Set(
        readdirSync(POSTS_DIR)
            .filter((f) => f.endsWith(".mdx"))
            .map((f) => f.replace(/\.mdx$/, ""))
    );

    const added: string[] = [];
    const updated: string[] = [];
    let unchanged = 0;

    for (const post of posts) {
        const path = `${POSTS_DIR}/${post.slug}.mdx`;
        const next = toMdx(post);
        const previous = existing.has(post.slug) ? readFileSync(path, "utf8") : null;

        if (previous === next) {
            unchanged++;
        } else if (previous === null) {
            added.push(post.slug);
            if (!dryRun) writeFileSync(path, next, "utf8");
        } else {
            updated.push(post.slug);
            if (!dryRun) writeFileSync(path, next, "utf8");
        }
        existing.delete(post.slug);
    }

    // DB 에서 사라진 글은 백업에서도 지운다. 그래야 백업이 DB 의 거울이 된다.
    const removed = [...existing];
    if (!dryRun) {
        for (const slug of removed) unlinkSync(`${POSTS_DIR}/${slug}.mdx`);
    }

    console.log(`DB 포스트 ${posts.length}개 (발행 ${posts.filter((p) => p.status === "PUBLISHED").length}, 초안 ${posts.filter((p) => p.status === "DRAFT").length})`);
    console.log("");
    console.log(`  변경 없음  ${unchanged}`);
    console.log(`  추가       ${added.length}${added.length ? "  " + added.join(", ") : ""}`);
    console.log(`  갱신       ${updated.length}${updated.length ? "  " + updated.join(", ") : ""}`);
    console.log(`  삭제       ${removed.length}${removed.length ? "  " + removed.join(", ") : ""}`);
    console.log("");
    console.log(
        dryRun
            ? "실제로 쓰려면 --dry-run 을 빼세요."
            : "내보내기 완료. git 에 커밋해두면 백업이 됩니다."
    );
}

await main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
