/** Integration check against an isolated, running local server. Never production. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.AI_TEST_URL;
const key = process.env.AI_TEST_KEY;
const fixture = process.env.AI_TEST_PAYLOAD;
if (!base || !["localhost", "127.0.0.1"].includes(new URL(base).hostname) || !key || !fixture) throw new Error("Set AI_TEST_URL (localhost only), AI_TEST_KEY and AI_TEST_PAYLOAD for an isolated database");
const payload = JSON.parse(await readFile(fixture, "utf8"));
async function send(path: string, body?: unknown, token?: string) {
    return fetch(base + path, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
}
assert.equal((await send("/api/internal/ai-usage", payload)).status, 401);
assert.equal((await send("/api/internal/ai-usage", { ...payload, schema: 999 }, key)).status, 400);
const first = await send("/api/internal/ai-usage", payload, key); assert.equal(first.status, 200);
assert.equal((await (await send("/api/internal/ai-usage", payload, key)).json()).accepted, false);
assert.equal((await (await send("/api/internal/ai-usage", { ...payload, generatedAt: "2020-01-01T00:00:00Z" }, key)).json()).accepted, false);
assert.equal((await send("/api/admin/ai")).status, 404);
assert.equal((await send("/api/admin/ai/content", { title: "unauthorized" })).status, 404);
const publicResponse = await send("/ai"); assert.equal(publicResponse.status, 200);
const html = await publicResponse.text();
for (const year of payload.years) {
    for (const device of year.devices) assert.equal(html.includes(device.device), false);
    for (const week of year.weeks) for (const group of week.groups) if (group.project !== "unmapped") assert.equal(html.includes(group.project), false);
}
console.log("AI API: authentication, schema, retry/order and public response checks passed");

// Optional signed-session fixtures exercise the actual role guards and cache path.
const adminCookie = process.env.AI_TEST_ADMIN_COOKIE;
const userCookie = process.env.AI_TEST_USER_COOKIE;
const postId = process.env.AI_TEST_POST_ID;
if (adminCookie && userCookie && postId?.startsWith("ai-test-")) {
    async function authenticated(path: string, cookie: string, method = "GET", body?: unknown) {
        return fetch(base + path, { method, headers: { "Content-Type": "application/json", Cookie: cookie }, body: body ? JSON.stringify(body) : undefined });
    }
    assert.equal((await authenticated("/api/admin/ai", userCookie)).status, 404);
    assert.equal((await authenticated("/api/admin/ai", adminCookie)).status, 200);
    const entry = { id: undefined as string | undefined, kind: "improvement", title: "AI_API_PUBLICATION_TEST", body: "Local integration fixture", date: "2026-09-30", postId, published: false };
    assert.equal((await authenticated("/api/admin/ai/content", userCookie, "POST", entry)).status, 404);
    const created = await authenticated("/api/admin/ai/content", adminCookie, "POST", entry); assert.equal(created.status, 200); entry.id = (await created.json()).id;
    assert.equal((await (await send("/ai")).text()).includes(entry.title), false);
    const postPath = `/api/admin/posts/${postId}`;
    assert.equal((await authenticated(postPath, adminCookie, "PATCH", { status: "PUBLISHED" })).status, 200);
    entry.published = true;
    assert.equal((await authenticated("/api/admin/ai/content", adminCookie, "POST", entry)).status, 200);
    assert.equal((await (await send("/ai")).text()).includes(entry.title), true);
    assert.equal((await authenticated(postPath, adminCookie, "PATCH", { status: "DRAFT" })).status, 200);
    assert.equal((await (await send("/ai")).text()).includes(entry.title), false);
    assert.equal((await authenticated(postPath, adminCookie, "PATCH", { status: "PUBLISHED" })).status, 200);
    assert.equal((await (await send("/ai")).text()).includes(entry.title), true);
    entry.published = false;
    assert.equal((await authenticated("/api/admin/ai/content", adminCookie, "POST", entry)).status, 200);
    assert.equal((await (await send("/ai")).text()).includes(entry.title), false);
    console.log("AI API: signed-session role checks and publication/post visibility lifecycle passed");
} else {
    console.log("Signed-session checks skipped: set AI_TEST_ADMIN_COOKIE, AI_TEST_USER_COOKIE and AI_TEST_POST_ID=ai-test-* for local fixtures");
}
