import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { NextResponse } from "next/server";
import type { setLike } from "../src/lib/likes";
import type { changeLike } from "../src/lib/like-api";

function isolated<T>(path: string, imports: Record<string, unknown>): T {
    const exports = {};
    runInNewContext(ts.transpileModule(readFileSync(path, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, { exports, URL, require: (name: string) => { assert.ok(name in imports, name); return imports[name]; } });
    return exports as T;
}
class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }
const posts = new Map([
    ["post", { id: "post", slug: "published", authorId: "owner", status: "PUBLISHED", updatedAt: "original" }],
    ["draft", { id: "draft", slug: "draft", authorId: "owner", status: "DRAFT", updatedAt: "original" }],
]);
const comments = new Map([
    ["comment", { id: "comment", postId: "post", authorId: "writer", deletedAt: null, updatedAt: "original" }],
    ["deleted", { id: "deleted", postId: "post", authorId: "writer", deletedAt: new Date(), updatedAt: "original" }],
    ["draft-comment", { id: "draft-comment", postId: "draft", authorId: "writer", deletedAt: null, updatedAt: "original" }],
]);
const postLikes = new Set<string>();
const commentLikes = new Set<string>();
function model(rows: Set<string>, field: "postId" | "commentId") {
    return {
        createMany: async ({ data, skipDuplicates }: { data: Record<string, string>[]; skipDuplicates: boolean }) => {
            assert.equal(skipDuplicates, true);
            data.forEach(row => rows.add(`${row[field]}:${row.userId}`));
        },
        deleteMany: async ({ where }: { where: Record<string, string> }) => rows.delete(`${where[field]}:${where.userId}`),
        count: async ({ where }: { where: Record<string, string> }) => [...rows].filter(key => key.startsWith(`${where[field]}:`)).length,
    };
}
const tx = {
    postLike: model(postLikes, "postId"), commentLike: model(commentLikes, "commentId"),
    $queryRaw: async (parts: TemplateStringsArray, value: string) => {
        const sql = parts.join("?");
        assert.match(sql, /FOR (UPDATE|SHARE)/, "Eligibility must be checked while holding a target lock");
        const row = sql.includes("FROM comments") ? comments.get(value)
            : sql.includes("WHERE slug") ? [...posts.values()].find(post => post.slug === value) : posts.get(value);
        return row ? [row] : [];
    },
};
// DB row locks serialize one target. The mock serializes transactions to exercise that contract.
let queue = Promise.resolve<unknown>(undefined);
const prisma = { $transaction: (work: (tx: unknown) => unknown) => {
    const result = queue.then(() => work(tx));
    queue = result.catch(() => {});
    return result;
} };
const { setLike: set } = isolated<{ setLike: typeof setLike }>("src/lib/likes.ts", {
    "@/lib/prisma": { prisma }, "@/lib/auth": { HttpError },
});
const post = { kind: "post", slug: "published" } as const;
const comment = { kind: "comment", id: "comment" } as const;
for (const target of [post, comment]) {
    const results = await Promise.all(Array.from({ length: 8 }, () => set(target, "reader", true)));
    assert.ok(results.every(result => result.likeCount === 1 && result.likedByMe));
    assert.equal((await set(target, "reader2", true)).likeCount, 2);
    const removed = await Promise.all(Array.from({ length: 8 }, () => set(target, "reader", false)));
    assert.ok(removed.every(result => result.likeCount === 1 && !result.likedByMe));
    assert.equal((await set(target, "reader", true)).likeCount, 2);
}
for (const liked of [true, false]) {
    await assert.rejects(set(post, "owner", liked), (e: unknown) => e instanceof HttpError && e.status === 403);
    await assert.rejects(set(comment, "writer", liked), (e: unknown) => e instanceof HttpError && e.status === 403);
    for (const target of [{ kind: "post", slug: "draft" }, { kind: "post", slug: "missing" }, { kind: "comment", id: "deleted" }, { kind: "comment", id: "draft-comment" }, { kind: "comment", id: "missing" }] as const) {
        await assert.rejects(set(target, "reader", liked), (e: unknown) => e instanceof HttpError && e.status === 404);
    }
}
assert.ok([...posts.values(), ...comments.values()].every(row => row.updatedAt === "original"));

let authenticated = false;
let writes = 0;
let limited = false;
const { changeLike: change } = isolated<{ changeLike: typeof changeLike }>("src/lib/like-api.ts", {
    "next/server": { NextResponse },
    "@/lib/auth": { HttpError, requireUserApi: async () => { if (!authenticated) throw new HttpError(401, "login"); return { id: "reader" }; } },
    "@/lib/api": { handleApiError: (e: HttpError) => NextResponse.json({ error: e.message }, { status: e.status }) },
    "@/lib/rate-limit": { overLimit: () => limited },
    "@/lib/likes": { setLike: async () => { writes++; return { likeCount: 1, likedByMe: true, isMine: false }; } },
});
const request = new Request("https://blog.test/api/posts/published/likes", { method: "PUT", headers: { origin: "https://blog.test" } });
assert.equal((await change(request, post, true)).status, 401);
authenticated = true;
assert.equal((await change(new Request(request, { headers: { origin: "https://other.test" } }), post, true)).status, 403);
limited = true;
assert.equal((await change(request, post, true)).status, 429);
assert.equal(writes, 0);
limited = false;
const success = await change(request, post, true);
assert.equal(success.status, 200);
assert.equal(success.headers.get("cache-control"), "private, no-store");
assert.equal(writes, 1);

const migration = readFileSync("prisma/migrations/20260928000000_likes/migration.sql", "utf8");
assert.equal((migration.match(/ENABLE ROW LEVEL SECURITY/g) ?? []).length, 2);
assert.doesNotMatch(migration, /CREATE POLICY|SECURITY DEFINER/i);
assert.equal((migration.match(/ON DELETE CASCADE/g) ?? []).length, 4);
console.log("PASS: likes service with serialized mock transactions: duplicate add/remove, independent users, own/draft/deleted/missing targets, unchanged timestamps; API auth/origin/rate limit/cache; migration safeguards. Not a live PostgreSQL concurrency test.");
