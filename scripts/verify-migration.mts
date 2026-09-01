/**
 * 마이그레이션 결과 검증. 조용히 깨지는 항목을 잡는 것이 목적이다.
 *   yarn verify:migration
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import matter from "gray-matter";

try {
    loadEnvFile(".env");
} catch {
    // noop
}

const { prisma } = await import("../src/lib/prisma");

const POSTS_DIR = "backup/posts";
let failures = 0;

function assert(name: string, ok: boolean, detail = "") {
    if (ok) {
        console.log(`PASS  ${name}`);
    } else {
        failures++;
        console.log(`FAIL  ${name}${detail ? `\n      ${detail}` : ""}`);
    }
}

async function main() {
    const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
    const fileSlugs = new Set(files.map((f) => f.replace(/\.mdx$/, "")));
    const posts = await prisma.post.findMany();
    const dbSlugs = new Set(posts.map((p) => p.slug));

    // 1. 이전된 글이 모두 DB 에 있는가.
    //
    //    한쪽 방향만 본다. 웹 에디터로 쓴 글은 대응하는 mdx 파일이 없는 것이
    //    정상이므로, DB 에만 있는 글을 초과분으로 취급하면 안 된다.
    //    mdx 파일은 이전 당시의 백업이고, 이 검사는 그 백업과의 대조가 목적이다.
    const missing = [...fileSlugs].filter((slug) => !dbSlugs.has(slug));
    assert(
        `mdx 백업 ${files.length}개가 모두 DB 에 존재`,
        missing.length === 0,
        missing.length ? `누락: ${missing.join(", ")}` : ""
    );

    const dbOnly = [...dbSlugs].filter((slug) => !fileSlugs.has(slug));
    if (dbOnly.length > 0) {
        console.log(`INFO  웹 에디터로 작성된 글 ${dbOnly.length}개는 대조 대상에서 제외: ${dbOnly.join(", ")}`);
    }

    // 아래 항목별 검사는 mdx 원본이 있는 글에만 적용한다
    for (const post of posts.filter((p) => fileSlugs.has(p.slug))) {
        const raw = readFileSync(`${POSTS_DIR}/${post.slug}.mdx`, "utf8");
        const { content } = matter(raw);

        // 2. 참조 이미지 실재
        const imgs = [...post.contentHtml.matchAll(/<img src="(\/[^"]+)"/g)].map((m) => m[1]);
        const paths = [...imgs, ...(post.thumbnail ? [post.thumbnail] : [])];
        const brokenImages = paths.filter((p) => !existsSync(`public${decodeURIComponent(p)}`));
        assert(`${post.slug}: 이미지 실재`, brokenImages.length === 0, brokenImages.join(", "));

        // 3. aside 내부 마크다운이 파싱되었는가 (조용히 깨지는 지점)
        assert(`${post.slug}: aside 내부 마크다운 파싱됨`, !/<aside>\s*\*\*/.test(post.contentHtml));

        // 4. 지정된 펜스 언어가 실제로 하이라이팅 되었는가
        //    refractor 에 문법이 없으면 ignoreMissing 이 오류를 삼켜 색만 빠진다.
        const fenceLangs = new Set(
            [...content.matchAll(/^```([a-zA-Z]+)/gm)].map((m) => m[1])
        );
        const rendered = new Set(
            [...post.contentHtml.matchAll(/class="[^"]*language-([a-zA-Z]+)/g)].map((m) => m[1])
        );
        const unhighlighted = [...fenceLangs].filter((l) => !rendered.has(l));
        assert(`${post.slug}: 코드블록 하이라이팅`, unhighlighted.length === 0, unhighlighted.join(", "));
    }

    console.log(failures === 0 ? "\n전체 통과" : `\n실패 ${failures}건`);
    process.exit(failures ? 1 : 0);
}

await main().catch((err) => {
    console.error(err);
    process.exit(1);
}).finally(() => prisma.$disconnect());
