/** 실제 PostgreSQL에서 가상 800개 행만 조회한다. DB·Storage에 쓰지 않는다. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { z } from "zod";
loadEnvFile(".env");
const { prisma } = await import("../src/lib/prisma");
const storage = await import("../src/lib/storage");
const navigation = await import("../src/lib/admin-navigation");
const shared = await import("../src/lib/admin-image-query");
type Service = typeof import("../src/lib/admin-images");
const rows = Array.from({ length: 800 }, (_, i) => ({
    bucket_id: "post-images", name: `posts/post-${i % 4}/${String(i).padStart(4,"0")}.${i % 3 ? "png" : "JPG"}`,
    metadata: { size: (i % 7) * 102400 },
    // 같은 시각과 밀리초 미만 차이를 함께 넣어 커서 정밀도 손실을 검출한다.
    created_at: `2026-01-${String(1 + i % 20).padStart(2,"0")}T00:00:00.${String(123000 + i % 3).padStart(6,"0")}Z`,
}));
rows.push({ bucket_id: "other-bucket", name: "must-not-appear.png", metadata: { size: 1 }, created_at: rows[0].created_at });
const usage = new Map<string, import("../src/lib/storage").ImageUsage>();
for (let i = 0; i < 400; i++) {
    const user = { id: `id-${i % 4}`, slug: `post-${i % 4}`, title: `글 ${i % 4} %_`, status: "DRAFT" as const };
    usage.set(rows[i].name, { thumbnail: i % 2 ? [] : [user], body: i % 2 ? [user] : [] });
}
const imports: Record<string, unknown> = {
    zod: { z }, "./storage": { ...storage, collectImageUsage: async () => usage },
    "./admin-navigation": navigation, "./admin-image-query": shared,
    "./prisma": { prisma: { $queryRawUnsafe: (sql: string, ...params: unknown[]) => {
        assert.match(sql, /FROM storage\.objects o/);
        const virtual = `FROM jsonb_to_recordset($${params.length + 1}::jsonb) AS o(bucket_id text, name text, metadata jsonb, created_at timestamptz)`;
        return prisma.$queryRawUnsafe(sql.replace("FROM storage.objects o", virtual), ...params, JSON.stringify(rows));
    } } },
};
const exports = {};
runInNewContext(ts.transpileModule(readFileSync("src/lib/admin-images.ts","utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports, Buffer, Date, require: (name: string) => { assert.ok(name in imports); return imports[name]; } });
const service = exports as Service;
try {
    for (const sort of ["newest", "oldest", "size"] as const) {
        const query = { ...shared.DEFAULT_IMAGE_QUERY, sort };
        let cursor: string | undefined;
        const paths: string[] = [];
        let pages = 0;
        do {
            const page = await service.getImagePage(query, cursor);
            assert.equal(page.totalCount, 800);
            assert.equal(page.count, 800);
            assert.equal(page.counts.thumbnail, 200);
            assert.equal(page.counts.body, 200);
            assert.equal(page.scheduledCount, 400);
            assert.ok(page.images.length <= 24);
            paths.push(...page.images.map(image => image.path));
            cursor = page.nextCursor ?? undefined;
            assert.ok(++pages <= 34, "cursor must terminate");
        } while (cursor);
        const expected = rows.filter(row => row.bucket_id === "post-images").sort((a,b) => {
            const order = sort === "size" ? b.metadata.size - a.metadata.size
                : sort === "newest" ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at);
            return order || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
        });
        assert.equal(new Set(paths).size, 800);
        assert.deepEqual(paths, expected.map(row => row.name));
        console.log(`PASS: ${sort}: 800 images / ${pages} pages, stable ties and microsecond cursor`);
    }
    const post = await service.getImagePage({ ...shared.DEFAULT_IMAGE_QUERY, post: "id-0" });
    assert.equal(post.count, 200); // 사용 중 100개 + 같은 폴더의 미사용 100개
    assert.equal(post.scheduledCount, 100);
    assert.equal(post.posts.find(p => p.id === "id-0")?.count, 200);
    const literal = await service.getImagePage({ ...shared.DEFAULT_IMAGE_QUERY, q: "%_" });
    assert.equal(literal.count, 400, "search wildcards are literal text");
    const date = await service.getImagePage({ ...shared.DEFAULT_IMAGE_QUERY, from: "2026-01-01", to: "2026-01-01" });
    assert.equal(date.count, 40);
    const empty = await service.getImagePage({ ...shared.DEFAULT_IMAGE_QUERY, q: "' OR true --" });
    assert.equal(empty.count, 0);
    assert.equal(empty.nextCursor, null);
    const first = await service.getImagePage();
    await assert.rejects(service.getImagePage({ ...shared.DEFAULT_IMAGE_QUERY, filter: "body" }, first.nextCursor!), /목록 위치/);
    await assert.rejects(service.getImagePage(shared.DEFAULT_IMAGE_QUERY, "invalid"), /목록 위치/);
    assert.throws(() => service.parseImageQuery(new URLSearchParams("from=2026-02-30")), /필터 값/);
    const targets = await service.getScheduledImageTargets({ ...shared.DEFAULT_IMAGE_QUERY, post: "id-0", filter: "thumbnail" });
    assert.equal(targets.length, 100, "bulk target scope includes unloaded images and ignores usage tab");
    assert.ok(targets.every(target => !usage.has(target.path)));
    console.log("PASS: global counts/options, post folders, literal search, KST dates, empty results, cursor validation, unloaded deletion targets");
} finally { await prisma.$disconnect(); }
