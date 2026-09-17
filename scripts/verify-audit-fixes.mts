import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { referencedImagePaths } from "../src/lib/image-references";
import { slugSchema } from "../src/lib/validation";
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
assert.equal(slugSchema.safeParse("privacy").success, false);
assert.equal(slugSchema.safeParse("privacy-guide").success, true);

class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }
let removed = false;
let count = 1;
const { deleteComment: remove } = isolated<{ deleteComment: typeof deleteComment }>("src/lib/comments.ts", {
    "@/lib/admin-navigation": {}, "@/lib/auth": { HttpError },
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
