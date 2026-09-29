import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import type * as Storage from "../src/lib/storage";

// 실제 Storage·DB 접속 없이 목록의 누락, 요청 상한, 오류 시 삭제 차단을 검증한다.
type Entry = { id: string | null; name: string; metadata?: { size: number }; created_at?: string };
const file = (name: string): Entry => ({ id: name, name, metadata: { size: 32 }, created_at: "2026-01-01T00:00:00Z" });
const tree: Record<string, Entry[]> = {
    "": Array.from({ length: 14 }, (_, i) => ({ id: null, name: `folder-${i}` })),
    "folder-0": Array.from({ length: 1001 }, (_, i) => file(`${String(i).padStart(4, "0")}.png`)),
    "folder-1": [{ id: null, name: "nested" }],
    "folder-1/nested": [file("used.png")],
};
let active = 0, peak = 0, deletes = 0;
let failList = false, failUsage = false, failMetadata = false;
let metadataCalls = 0;
const calls: string[] = [];
const bucket = {
    list: async (prefix: string, { offset, limit }: { offset: number; limit: number }) => {
        active++;
        peak = Math.max(peak, active);
        calls.push(`${prefix}:${offset}`);
        await new Promise(resolve => setTimeout(resolve, 2));
        active--;
        return failList && prefix === "folder-1" ? { error: { message: "test failure" } } : { data: (tree[prefix] ?? []).slice(offset, offset + limit), error: null };
    },
    getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example.invalid/${path}` } }),
    remove: async () => { deletes++; return { error: null }; },
};
const imports: Record<string, unknown> = {
    "@supabase/supabase-js": { createClient: () => ({ storage: { from: () => bucket } }) },
    "@/lib/prisma": { prisma: {
        $queryRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
            metadataCalls++;
            assert.match(strings.join("?"), /FROM storage\.objects\s+WHERE bucket_id = \?/);
            assert.deepEqual(values, ["post-images"]);
            if (failMetadata) throw new Error("metadata unavailable");
            return Object.entries(tree).flatMap(([prefix, entries]) => entries.filter(entry => entry.id !== null).map(entry => ({
                path: prefix ? `${prefix}/${entry.name}` : entry.name,
                size: entry.metadata ? String(entry.metadata.size) : null,
                createdAt: entry.created_at ? new Date(entry.created_at) : null,
            })));
        },
        post: { findMany: async () => {
        if (failUsage) throw new Error("usage unavailable");
        return [{ id: "post", slug: "post", title: "Post", status: "DRAFT", thumbnail: "folder-1/nested/used.png", contentMd: "" }];
    } } } },
    "@/lib/image-references": { referencedImagePaths: (value: string) => value ? [value] : [] },
};
const exports = {};
runInNewContext(ts.transpileModule(readFileSync("src/lib/storage.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
    exports,
    process: { env: { SUPABASE_SECRET_KEY: "test-only", NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid" } },
    require: (name: string) => { assert.ok(name in imports, `Unexpected import ${name}`); return imports[name]; },
});
const storage = exports as typeof Storage;
const { images } = await storage.classifyImages(new Date("2026-09-29T00:00:00Z"));
assert.equal(images.length, 1002);
assert.equal(new Set(images.map(image => image.path)).size, 1002);
assert.equal(metadataCalls, 1);
assert.equal(calls.length, 0, "display listing must not walk Storage folders");
assert.equal(images.find(image => image.path.endsWith("used.png"))?.state, "used");
assert.equal(images.filter(image => image.state === "scheduled").length, 1001);
// 삭제 대상 재확인은 기존 Storage API로 모든 페이지를 읽는다.
const dryRun = await storage.sweepOrphanImages();
assert.equal(dryRun.total, 1002);
assert.equal(dryRun.orphans.length, 1001);
assert.ok(calls.includes("folder-0:1000"));
assert.ok(peak > 1 && peak <= 6, `concurrent requests: ${peak}`);
assert.equal(metadataCalls, 1, "sweep must not use display metadata lookup");
failMetadata = true;
await assert.rejects(storage.classifyImages(), /metadata unavailable/);
assert.equal(deletes, 0);
failMetadata = false;
await assert.rejects(storage.deleteUnusedImages(["folder-1/nested/used.png"]), /쓰고 있어/);
await assert.rejects(storage.deleteUnusedImages(["missing.png"]), /이미 없는/);
assert.equal(deletes, 0);
failList = true;
await assert.rejects(storage.sweepOrphanImages({ dryRun: false }), /test failure/);
assert.equal(deletes, 0);
// 이미 시작한 읽기가 끝난 뒤 참조 조회 실패 경로를 따로 검증한다.
await new Promise(resolve => setTimeout(resolve, 20));
failList = false;
failUsage = true;
const previousCalls = calls.length;
await assert.rejects(storage.sweepOrphanImages({ dryRun: false }), /usage unavailable/);
assert.equal(calls.length, previousCalls);
assert.equal(deletes, 0);
console.log("PASS: one-query display metadata, nested paths, fresh Storage API deletion checks, pagination, bounded concurrency, failure blocks deletion");
