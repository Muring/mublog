/**
 * 저장소에 커밋된 public/thumbnails·public/images 의 글 이미지를 Storage 로 옮긴다.
 *
 *   yarn migrate:public-images             무엇이 바뀔지만 출력 (기본값, 안전)
 *   yarn migrate:public-images --apply     실제 이전
 *
 *   public/thumbnails/<name>.png          ->  thumbnails/<slug>/thumbnail-<hash>.png
 *                                             (여러 글이 함께 쓰면 thumbnails/shared/<name>-<hash>.png)
 *   public/images/<post>/**\/<name>.png    ->  posts/<slug>/image-<n>-<hash>.png
 *
 * 왜 옮기나: opengraph-image 가 public/ 을 fs 로 읽어서 Next 가 public/ 전체(19MB)를
 * 서버리스 함수 번들에 실었고, 그것이 배포마다 쌓여 Vercel Function Storage 를 먹었다.
 * 글 이미지의 출처를 Storage 하나로 모으면 함수가 public/ 을 읽을 이유가 없어진다.
 *
 * migrate-images 와 같은 순서다 — 업로드 -> 본문·썸네일 치환 -> 로컬 파일 삭제.
 * 중간에 끊겨도 로컬 파일이 남아 있어 글은 계속 열린다.
 *
 * 남기는 것: public/images/portfolio (포트폴리오 화면이 정적으로 씀),
 * *.svg (page-not-found·default 는 컴포넌트 기본값). 어느 글도 안 쓰는 파일은
 * 올리지 않고 지운다 — git 이력에 남아 있다.
 */
import { readdirSync, readFileSync, unlinkSync, rmdirSync, existsSync } from "node:fs";
import { join, sep, dirname, basename, extname } from "node:path";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

try {
    loadEnvFile(".env");
} catch {
    // 플랫폼이 환경변수를 직접 주입하는 경우
}

const { prisma } = await import("../src/lib/prisma");

const BUCKET = "post-images";
const SOURCES = [
    { dir: "public/thumbnails", url: "/thumbnails", kind: "thumbnail" },
    { dir: "public/images", url: "/images", kind: "body" },
] as const;
const KEEP = [/^public\/images\/portfolio\//, /[.]svg$/i];
const IMAGE_FILE = /[.](png|jpe?g|webp|gif)$/i;
const CONTENT_TYPE: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
};

const apply = process.argv.includes("--apply");

const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!secretKey) throw new Error("SUPABASE_SECRET_KEY 가 설정되지 않았습니다.");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false },
});

const shortId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 8);
const extensionOf = (path: string) => extname(path).slice(1).toLowerCase();
const publicUrlOf = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

/** 로컬 경로가 본문 어딘가에 "그 주소로" 나오는 자리. Storage URL 안의 같은 꼬리는 안 잡는다. */
const occurrences = (text: string, url: string) => {
    const pattern = new RegExp(`(?<![\\w/])${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w])`, "g");
    return [...text.matchAll(pattern)].map((m) => m.index);
};

function listFiles(dir: string): string[] {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { recursive: true, encoding: "utf8" })
        .map((entry) => join(dir, entry).split(sep).join("/"))
        .filter((path) => IMAGE_FILE.test(path) && !KEEP.some((re) => re.test(path)))
        .sort();
}

type Move = { file: string; url: string; to: string; reason: string };

async function main() {
    const posts = await prisma.post.findMany({
        select: { id: true, slug: true, contentMd: true, contentHtml: true, thumbnail: true },
    });

    const moves: Move[] = [];
    const unused: string[] = [];
    const bodyByPost = new Map<string, { file: string; url: string; at: number }[]>();

    for (const source of SOURCES) {
        for (const file of listFiles(source.dir)) {
            const url = source.url + file.slice(source.dir.length);
            const ext = extensionOf(file);

            const asThumbnail = posts.filter((post) => post.thumbnail === url);
            if (asThumbnail.length > 1) {
                const name = basename(file, extname(file));
                moves.push({ file, url, to: `thumbnails/shared/${name}-${shortId()}.${ext}`, reason: `${asThumbnail.map((p) => p.slug).join(", ")} 의 썸네일` });
                continue;
            }
            if (asThumbnail.length === 1) {
                moves.push({ file, url, to: `thumbnails/${asThumbnail[0].slug}/thumbnail-${shortId()}.${ext}`, reason: `${asThumbnail[0].slug} 의 썸네일` });
                continue;
            }

            const inBody = posts.find((post) => occurrences(post.contentMd, url).length > 0);
            if (inBody) {
                const list = bodyByPost.get(inBody.slug) ?? [];
                list.push({ file, url, at: occurrences(inBody.contentMd, url)[0]! });
                bodyByPost.set(inBody.slug, list);
                continue;
            }

            unused.push(file);
        }
    }

    // 번호는 본문에 나오는 차례를 따른다 (migrate-images 와 같은 이유)
    for (const [slug, entries] of bodyByPost) {
        entries.sort((a, b) => a.at - b.at);
        entries.forEach(({ file, url }, index) => {
            moves.push({ file, url, to: `posts/${slug}/image-${index + 1}-${shortId()}.${extensionOf(file)}`, reason: `${slug} 의 본문 ${index + 1}번째` });
        });
    }

    for (const move of moves) console.log(`  ${move.file}\n    -> ${move.to}   (${move.reason})`);
    if (unused.length > 0) {
        console.log(`\n  어느 글도 안 쓰는 ${unused.length}개는 올리지 않고 지운다 (git 이력에 남는다)`);
        for (const file of unused) console.log(`    ${file}`);
    }

    if (!apply) {
        console.log(`\n실제로 옮기려면 --apply 를 붙이세요.`);
        return;
    }
    if (moves.length === 0 && unused.length === 0) {
        console.log(`\n옮길 것이 없습니다.`);
        return;
    }

    // 1) 업로드. 이 단계까지는 무엇도 지우지 않으므로 언제 끊겨도 글이 멀쩡하다.
    console.log("");
    for (const move of moves) {
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(move.to, readFileSync(move.file), { contentType: CONTENT_TYPE[extensionOf(move.file)], upsert: false });
        if (error) throw new Error(`업로드 실패 ${move.file}: ${error.message}`);
        console.log(`  업로드  ${move.to}`);
    }

    // 2) 본문·렌더 결과·썸네일의 주소를 함께 바꾼다. contentHtml 에도 옛 주소가 들어 있다.
    let changed = 0;
    for (const post of posts) {
        let contentMd = post.contentMd;
        let contentHtml = post.contentHtml;
        let thumbnail = post.thumbnail ?? "";

        for (const move of moves) {
            const replacement = publicUrlOf(move.to);
            const pattern = new RegExp(`(?<![\\w/])${move.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w])`, "g");
            contentMd = contentMd.replace(pattern, replacement);
            contentHtml = contentHtml.replace(pattern, replacement);
            if (thumbnail === move.url) thumbnail = replacement;
        }

        const untouched =
            contentMd === post.contentMd &&
            contentHtml === post.contentHtml &&
            thumbnail === (post.thumbnail ?? "");
        if (untouched) continue;

        // prisma.post.update 는 @updatedAt 을 올려 수정일이 오늘로 바뀐다 (migrate-images 와 같은 이유)
        await prisma.$executeRaw`
            UPDATE posts
               SET content_md = ${contentMd},
                   content_html = ${contentHtml},
                   thumbnail = ${thumbnail || null}
             WHERE id = ${post.id}
        `;
        changed++;
        console.log(`  치환  ${post.slug}`);
    }

    // 3) 로컬 파일 삭제. 여기까지 오면 아무도 그것을 가리키지 않는다. 빈 폴더도 걷는다.
    for (const file of [...moves.map((m) => m.file), ...unused]) {
        unlinkSync(file);
        let dir = dirname(file);
        while (dir.startsWith("public/") && readdirSync(dir).length === 0) {
            rmdirSync(dir);
            dir = dirname(dir);
        }
    }

    console.log(`\n완료. 파일 ${moves.length}개 이전, ${unused.length}개 삭제, 글 ${changed}개.`);
    console.log(
        [
            "",
            "다음 할 일:",
            "  git add -A public   (지운 파일을 스테이징)",
            "  yarn revalidate     (배포본 페이지 캐시 무효화)",
            "  yarn backup:posts   (백업을 새 주소로)",
        ].join("\n")
    );
}

await main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
