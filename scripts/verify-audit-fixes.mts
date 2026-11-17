import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { referencedImagePaths } from "../src/lib/image-references";
import { postInputSchema, postPatchSchema, slugSchema } from "../src/lib/validation";
import type { useEditorUploads } from "../src/components/admin/useEditorUploads";
import type { usePostSave } from "../src/components/admin/usePostSave";
import type { deleteComment } from "../src/lib/comments";

// 실제 모듈을 실행하되 DB·Storage·React 환경만 대체한다. 외부 접속이나 데이터 변경은 없다.
function isolated<T>(path: string, imports: Record<string, unknown>): T {
    const exports = {};
    const code = ts.transpileModule(readFileSync(path, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    runInNewContext(code, {
        exports, crypto, FormData, File, console,
        require: (name: string) => {
            assert.ok(name in imports, `Unexpected import: ${name}`);
            return imports[name];
        },
    });
    return exports as T;
}

const prefix = "https://example.invalid/storage/v1/object/public/post-images/";
assert.deepEqual(referencedImagePaths(`![](${prefix}a.png?download=1)![](${prefix}b.svg#icon)`, "post-images"), ["a.png", "b.svg"]);
assert.deepEqual(referencedImagePaths(`<img src="${prefix}%ED%95%9C%EA%B8%80%20%281%29.png?x=2">`, "post-images"), ["한글 (1).png"]);
assert.deepEqual(referencedImagePaths(`${prefix}a%3Fb%23c.png`, "post-images"), ["a?b#c.png"]);
assert.throws(() => referencedImagePaths(`${prefix}bad%ZZ.png`, "post-images"));
// 공개 주소가 아니어도 그 파일을 쓰는 것이다. 놓치면 sweep 이 쓰는 중인 이미지를 지운다.
const origin = "https://example.invalid/storage/v1";
assert.deepEqual(
    referencedImagePaths(`![](${origin}/render/image/public/post-images/posts/a/image-1.png?width=600) ${origin}/object/sign/post-images/b.png?token=x`, "post-images"),
    ["posts/a/image-1.png", "b.png"]
);
assert.deepEqual(referencedImagePaths(`${origin}/object/public/other-bucket/a.png ${origin}/object/public/post-images-old/b.png`, "post-images"), []);
assert.equal(slugSchema.safeParse("privacy").success, false);
assert.equal(slugSchema.safeParse("privacy-guide").success, true);

class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }
let removed = false;
let count = 1;
const { deleteComment: remove } = isolated<{ deleteComment: typeof deleteComment }>("src/lib/comments.ts", {
    "@/lib/admin-navigation": {}, "@/lib/admin-dates": {}, "@/lib/auth": { HttpError },
    "@/lib/prisma": { prisma: {
        comment: { findUnique: async () => ({ authorId: "author", postId: "post", deletedAt: null, post: { slug: "post" } }) },
        $transaction: async (work: (tx: unknown) => Promise<void>) => work({
            comment: { updateMany: async ({ where }: { where: { deletedAt?: null } }) => {
                if (removed && where.deletedAt === null) return { count: 0 };
                removed = true;
                return { count: 1 };
            } },
            $executeRaw: async () => { count--; },
        }),
    } },
});
await assert.rejects(remove({ id: "c", actorId: "other", isAdmin: false }), (error: unknown) => error instanceof HttpError && error.status === 403);
const deletes = await Promise.allSettled([remove({ id: "c", actorId: "author", isAdmin: false }), remove({ id: "c", actorId: "admin", isAdmin: true })]);
assert.equal(deletes.filter((result) => result.status === "fulfilled").length, 1);
assert.equal(count, 0);

const react = {
    useRef: (value: unknown) => ({ current: value }),
    useState: (value: unknown) => [value, () => {}],
    useCallback: (fn: unknown) => fn,
};
const toast = { error: () => {}, success: () => {} };
const requests: { resolve: (value: { url: string }) => void; reject: (reason: Error) => void }[] = [];
const { useEditorUploads: uploadsHook } = isolated<{ useEditorUploads: typeof useEditorUploads }>("src/components/admin/useEditorUploads.ts", {
    react, "@/providers/Toast": { useToast: () => toast },
    "@/lib/fetcher": { fetchJson: () => new Promise((resolve, reject) => requests.push({ resolve, reject })) },
});
let content = "before after";
let thumbnail = "old";
const uploads = uploadsHook({ current: { selectionStart: 7 } as HTMLTextAreaElement }, update => { content = update(content); }, url => { thumbnail = url; }, "post");
const file = new File(["image"], "image.png", { type: "image/png" });
const bodyDone = uploads.uploadIntoBody([file, file]);
const thumbDone = uploads.uploadThumbnail(file);
assert.equal(uploads.uploadsPending(), true);
content += " edited";
requests[0].resolve({ url: "/first.png" });
await new Promise(resolve => setImmediate(resolve));
requests[1].resolve({ url: "/thumb.png" });
await thumbDone;
assert.equal(uploads.uploadsPending(), true, "The second body upload must still block saving");
requests[2].reject(new Error("upload failed"));
await bodyDone;
assert.equal(uploads.uploadsPending(), false);
assert.equal(thumbnail, "/thumb.png");
assert.equal(content, "before ![](/first.png)\nafter edited");

let saved = 0;
let blocked = true;
const { usePostSave: saveHook } = isolated<{ usePostSave: typeof usePostSave }>("src/components/admin/usePostSave.ts", {
    react, "@/providers/Toast": { useToast: () => toast },
    "next/navigation": { useRouter: () => ({ refresh: () => {}, push: () => {} }) },
    "@/lib/fetcher": { jsonRequest: () => ({}), fetchJson: async () => { saved++; return { slug: "post" }; } },
});
const save = saveHook({ id: "post", slug: "post", title: "Post", tags: ["test"], description: "", thumbnail, series: "", seriesOrder: "", contentMd: content, status: "DRAFT", publishedAt: null }, "post", () => {}, () => blocked);
await save.save("PUBLISHED");
assert.equal(saved, 0);
blocked = false;
await Promise.all([save.save("PUBLISHED"), save.save("PUBLISHED")]);
assert.equal(saved, 1);
console.log("PASS: image references, reserved slug, concurrent deletion, overlapping uploads, upload failure and save guards");

// 부분 수정에서 보내지 않은 태그는 그대로 둔다(.partial() 이 .default([]) 를 남겨 지우던 문제). 새 글은 여전히 [] 로 채운다
assert.equal(postPatchSchema.parse({ contentMd: "본문" }).tags, undefined);
assert.deepEqual(postPatchSchema.parse({ tags: ["a"] }).tags, ["a"]);
assert.deepEqual(postInputSchema.parse({ slug: "a", title: "t", contentMd: "", status: "DRAFT" }).tags, []);
console.log("patch schema keeps omitted tags");

// 발행은 내용 수정이 아니다. 실제 PATCH 를 실행하고 Prisma 의 @updatedAt 동작만 대체한다.
const originalDate = new Date("2026-11-01T00:00:00Z");
const saveDate = new Date("2026-11-17T00:00:00Z");
const originalPost = {
    id: "post", slug: "post", title: "Post", description: null, thumbnail: null,
    series: "Series", seriesOrder: 2, tags: ["project"], contentMd: "Original body",
    contentHtml: "<p>Original body</p>", readingTime: 1,
    status: "DRAFT", publishedAt: null as Date | null, updatedAt: originalDate,
};
let storedPost = { ...originalPost };
let renders = 0;
const invalidated: string[][] = [];
const { PATCH } = isolated<typeof import("../src/app/api/admin/posts/[id]/route")>("src/app/api/admin/posts/[id]/route.ts", {
    "next/server": { NextResponse: { json: (body: unknown) => body } },
    "@/lib/prisma": { prisma: { post: {
        findUnique: async () => ({ ...storedPost }),
        update: async ({ data }: { data: Partial<typeof storedPost> }) => {
            storedPost = { ...storedPost, updatedAt: saveDate, ...data };
            return storedPost;
        },
    } } },
    "@/lib/auth": { requireAdminApi: async () => {} },
    "@/lib/api": {
        parseBody: async (request: { json: () => Promise<unknown> }) => postPatchSchema.parse(await request.json()),
        handleApiError: (error: unknown) => { throw error; },
    },
    "@/lib/validation": { postPatchSchema },
    "@/lib/post-write": {
        isSlugTaken: async () => false,
        renderedContent: async (contentMd: string) => { renders++; return { contentMd, contentHtml: `<p>${contentMd}</p>`, readingTime: 1 }; },
    },
    "@/lib/revalidate": { revalidatePost: (...slugs: string[]) => invalidated.push(slugs) },
});
const patch = (input: unknown) => PATCH({ json: async () => input } as Parameters<typeof PATCH>[0], { params: Promise.resolve({ id: "post" }) });
const fullPayload = {
    slug: "post", title: "Post", description: null, thumbnail: null,
    series: "Series", seriesOrder: 2, tags: ["project"], contentMd: "Original body", publishedAt: null,
};
await patch({ ...fullPayload, status: "PUBLISHED" });
assert.equal(storedPost.updatedAt, originalDate, "Publishing unchanged editor content must preserve modified time");
assert.ok(storedPost.publishedAt, "First publication must still set publication time");
assert.equal(renders, 0, "Unchanged Markdown does not need rendering");
const firstPublishedAt = storedPost.publishedAt;
await patch({ status: "DRAFT" });
await patch({ status: "PUBLISHED" });
assert.equal(storedPost.updatedAt, originalDate);
assert.equal(storedPost.publishedAt, firstPublishedAt);
assert.equal(invalidated.length, 3, "Publishing and unpublishing still invalidate the public page");
await patch({ publishedAt: "2026-11-02T00:00:00Z" });
assert.equal(storedPost.updatedAt, originalDate);
await patch({ ...fullPayload, publishedAt: storedPost.publishedAt?.toISOString(), status: "PUBLISHED" });
await patch({});
assert.equal(storedPost.updatedAt, originalDate, "No-op saves must preserve modified time");
for (const change of [
    { contentMd: "Edited body" }, { title: "Edited title" }, { slug: "edited-post" },
    { description: "Description" }, { thumbnail: "/thumb.jpg" }, { tags: ["backend"] },
    { series: "Other series" }, { seriesOrder: 3 }, { series: null },
]) {
    storedPost = { ...originalPost };
    await patch({ ...change, status: "PUBLISHED" });
    assert.equal(storedPost.updatedAt, saveDate, `Actual edit must update modified time: ${JSON.stringify(change)}`);
}
assert.equal(storedPost.seriesOrder, null, "Clearing a series also clears its order");
assert.equal(renders, 1);
assert.ok(invalidated.some(([slug, previous]) => slug === "edited-post" && previous === "post"));
console.log("PASS: publication/no-op saves preserve modified time; actual content/metadata edits update it");
