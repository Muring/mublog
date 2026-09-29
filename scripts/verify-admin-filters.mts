import assert from "node:assert/strict";
import { withinAdminDates, imageFormat, matchesImageSize } from "../src/lib/admin-filters";
import { filterAdminPosts, postListState, postListUrl, safeAdminReturn } from "../src/lib/admin-navigation";

assert.equal(withinAdminDates("2026-09-28T14:59:59Z", "2026-09-29", "2026-09-29"), false);
assert.equal(withinAdminDates("2026-09-28T15:00:00Z", "2026-09-29", "2026-09-29"), true);
assert.equal(withinAdminDates("2026-09-29T14:59:59.999Z", "2026-09-29", "2026-09-29"), true);
assert.equal(withinAdminDates("2026-09-29T15:00:00Z", "2026-09-29", "2026-09-29"), false);
assert.equal(imageFormat("folder/PHOTO.JPG"), "jpeg");
assert.equal(imageFormat("folder.with.dots/file"), "");
assert.equal(imageFormat("folder/photo.jpeg"), "jpeg");
for (const [bytes, expected] of [[0, "small"], [102399, "small"], [102400, "medium"], [1048575, "medium"], [1048576, "large"]] as const) {
    assert.equal(["small", "medium", "large"].filter(size => matchesImageSize(bytes, size)).join(), expected);
}
const state = postListState(new URLSearchParams("from=2026-09-29&to=2026-09-29&hasComments=yes&tag=한글&sort=views"));
assert.deepEqual(postListState(new URL(postListUrl(state), "https://example.invalid").searchParams), state);
assert.equal(safeAdminReturn(postListUrl(state)), postListUrl(state));
assert.equal(postListState(new URLSearchParams("from=2026-02-30&hasComments=invalid")).from, "");
assert.equal(postListState(new URLSearchParams("hasComments=invalid")).hasComments, "");
const base = { title: "title", slug: "post", tags: ["한글"], status: "PUBLISHED", publishedAt: null, updatedAt: "2026-09-29T00:00:00Z", viewCount: 0 };
const posts = [
    { ...base, id: "in", createdAt: "2026-09-28T15:00:00Z", commentCount: 1 },
    { ...base, id: "none", createdAt: "2026-09-28T15:00:00Z", commentCount: 0 },
    { ...base, id: "out", createdAt: "2026-09-29T15:00:00Z", commentCount: 2 },
];
assert.deepEqual(filterAdminPosts(posts, state).map(post => post.id), ["in"]);
assert.deepEqual(filterAdminPosts(posts, { ...state, hasComments: "no" }).map(post => post.id), ["none"]);
assert.equal(filterAdminPosts(posts, { ...state, from: "", to: "", hasComments: "" }).length, 3);
console.log("PASS: KST date boundaries, file formats, size boundaries, URL round trip, combined post filters");
