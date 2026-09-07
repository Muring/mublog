/**
 * 옛 평평한 Storage 경로를 글·쓰임별 구조로 옮긴다.
 *
 *   yarn migrate:images             무엇이 바뀔지만 출력 (기본값, 안전)
 *   yarn migrate:images --apply     실제 이전
 *
 *   2026-09/<uuid>.png  ->  thumbnails/<slug>/thumbnail-<hash>.png
 *                           posts/<slug>/image-<n>-<hash>.png
 *
 * 한 번만 쓰는 스크립트지만 남겨 둔다. 무엇을 어떤 순서로 했는지가
 * 나중에 같은 일을 할 때의 유일한 기록이다.
 *
 * 순서가 안전의 전부다 — 복사 -> 본문·썸네일 치환 -> 옛 파일 삭제.
 * 중간에 끊겨도 옛 파일이 남아 있어 글은 계속 열린다. 반대로 하면
 * 치환에 실패한 순간 이미 지운 이미지를 가리키게 된다.
 *
 * 아무도 안 쓰는 파일은 건드리지 않는다. 그건 sweep:images 의 몫이다.
 */
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

try {
    loadEnvFile(".env");
} catch {
    // 플랫폼이 환경변수를 직접 주입하는 경우
}

const { prisma } = await import("../src/lib/prisma");

const BUCKET = "post-images";
/** 이미 새 구조에 있는 것 */
const NEW_PREFIXES = ["thumbnails/", "posts/", "_drafts/"];

const apply = process.argv.includes("--apply");

const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!secretKey) throw new Error("SUPABASE_SECRET_KEY 가 설정되지 않았습니다.");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false },
});

const shortId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 8);
const extensionOf = (path: string) => path.slice(path.lastIndexOf(".") + 1);

/** 버킷 전체를 훑는다. 깊이에 기대지 않는다 */
async function listAll(prefix = ""): Promise<string[]> {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
    if (error) throw new Error(`목록 조회 실패(${prefix || "/"}): ${error.message}`);

    const paths: string[] = [];
    for (const entry of data ?? []) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.id === null) paths.push(...(await listAll(path)));
        else paths.push(path);
    }
    return paths;
}

type Move = { from: string; to: string; reason: string };

async function main() {
    const posts = await prisma.post.findMany({
        select: { id: true, slug: true, contentMd: true, contentHtml: true, thumbnail: true },
    });

    const all = await listAll();
    const old = all.filter((path) => !NEW_PREFIXES.some((prefix) => path.startsWith(prefix)));

    console.log(`Storage 객체 ${all.length}개 · 옛 구조 ${old.length}개\n`);

    const moves: Move[] = [];
    const skipped: string[] = [];
    // 글마다 본문 이미지를 모아 두었다가, 본문에 실린 순서대로 번호를 매긴다
    const bodyByPost = new Map<string, { path: string; at: number }[]>();

    for (const path of old) {
        // 대표 이미지가 먼저다. 같은 글의 본문에도 있으면 썸네일 쪽으로 간다.
        const asThumbnail = posts.find((post) => (post.thumbnail ?? "").includes(path));
        if (asThumbnail) {
            moves.push({
                from: path,
                to: `thumbnails/${asThumbnail.slug}/thumbnail-${shortId()}.${extensionOf(path)}`,
                reason: `${asThumbnail.slug} 의 썸네일`,
            });
            continue;
        }

        const inBody = posts.find((post) => post.contentMd.includes(path));
        if (inBody) {
            const list = bodyByPost.get(inBody.slug) ?? [];
            list.push({ path, at: inBody.contentMd.indexOf(path) });
            bodyByPost.set(inBody.slug, list);
            continue;
        }

        skipped.push(path);
    }

    /*
     * 번호는 본문에 나오는 차례를 따른다. 목록에서 온 순서(uuid 알파벳순)로 매기면
     * image-1 이 글 한복판의 그림이 되어, 이름을 읽어서 얻는 것이 없어진다.
     */
    for (const [slug, entries] of bodyByPost) {
        entries.sort((a, b) => a.at - b.at);
        entries.forEach(({ path }, index) => {
            moves.push({
                from: path,
                to: `posts/${slug}/image-${index + 1}-${shortId()}.${extensionOf(path)}`,
                reason: `${slug} 의 본문 ${index + 1}번째`,
            });
        });
    }

    for (const move of moves) console.log(`  ${move.from}\n    -> ${move.to}   (${move.reason})`);
    if (skipped.length > 0) {
        console.log(`\n  아무도 안 쓰는 ${skipped.length}개는 그대로 둔다 (sweep:images 의 몫)`);
        for (const path of skipped) console.log(`    ${path}`);
    }

    if (!apply) {
        console.log(`\n실제로 옮기려면 --apply 를 붙이세요.`);
        return;
    }
    if (moves.length === 0) {
        console.log(`\n옮길 것이 없습니다.`);
        return;
    }

    // 1) 복사. 이 단계까지는 무엇을 지우지 않으므로 언제 끊겨도 글이 멀쩡하다.
    console.log("");
    for (const move of moves) {
        const { error } = await supabase.storage.from(BUCKET).copy(move.from, move.to);
        if (error) throw new Error(`복사 실패 ${move.from}: ${error.message}`);
        console.log(`  복사  ${move.to}`);
    }

    // 2) 본문·렌더 결과·썸네일의 주소를 함께 바꾼다.
    //    contentHtml 은 저장 시점에 렌더해 둔 것이라 여기도 옛 주소가 들어 있다.
    let changed = 0;
    for (const post of posts) {
        let contentMd = post.contentMd;
        let contentHtml = post.contentHtml;
        let thumbnail = post.thumbnail ?? "";

        for (const move of moves) {
            contentMd = contentMd.split(move.from).join(move.to);
            contentHtml = contentHtml.split(move.from).join(move.to);
            thumbnail = thumbnail.split(move.from).join(move.to);
        }

        const untouched =
            contentMd === post.contentMd &&
            contentHtml === post.contentHtml &&
            thumbnail === (post.thumbnail ?? "");
        if (untouched) continue;

        /*
         * prisma.post.update 를 쓰지 않는다. @updatedAt 이 따라 올라가
         * 관리 목록의 수정일이 전부 오늘로 바뀐다. 주소를 옮긴 것은
         * 내가 글을 고친 것이 아니므로 그 날짜는 그대로 두어야 한다.
         */
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

    // 3) 옛 파일 삭제. 여기까지 오면 아무도 그것을 가리키지 않는다.
    const { error } = await supabase.storage.from(BUCKET).remove(moves.map((m) => m.from));
    if (error) throw new Error(`옛 파일 삭제 실패: ${error.message}`);

    console.log(`\n완료. 파일 ${moves.length}개, 글 ${changed}개.`);
    console.log(
        [
            "",
            "주의: 페이지 캐시는 자동 무효화되지 않는다.",
            "  로컬   : rm -rf .next/cache 후 재빌드",
            "  배포본 : 재배포하거나 최대 1시간 대기",
        ].join("\n")
    );
}

await main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
