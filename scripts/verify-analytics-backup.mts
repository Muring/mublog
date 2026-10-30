import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as dates from "../src/lib/date";
import type * as Backup from "../src/lib/analytics-backup";

const env: Record<string, string> = {
    VERCEL_ANALYTICS_TOKEN: "test-token", ANALYTICS_VERCEL_PROJECT_ID: "project", ANALYTICS_VERCEL_TEAM_ID: "team",
    ANALYTICS_BACKUP_START_DATE: "2026-10-30", NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid", SUPABASE_SECRET_KEY: "test-secret",
};
const uploads = new Map<string, string>();
const requests: URL[] = [];
let publicBucket = false, failList = false, failUpload = false, failApi = false, badGrouping = false, badRange = false;
const storage = {
    getBucket: async () => ({ data: { public: publicBucket }, error: null }),
    from: (name: string) => {
        assert.equal(name, "analytics-backups");
        return {
            list: async () => ({ data: [], error: failList ? {} : null }),
            upload: async (path: string, body: string, options: { upsert: boolean; contentType: string }) => {
                assert.equal(options.upsert, true); assert.equal(options.contentType, "application/json");
                assert.ok(!body.includes("test-token") && !body.includes("test-secret"));
                if (!failUpload) uploads.set(path, body);
                return { error: failUpload ? {} : null };
            },
        };
    },
};
const imports: Record<string, unknown> = {
    "@supabase/supabase-js": { createClient: () => ({ storage }) }, "./date": dates,
};
const result = {};
runInNewContext(ts.transpileModule(readFileSync("src/lib/analytics-backup.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
    exports: result, URL, Date, AbortSignal, process: { env },
    require: (name: string) => { assert.ok(name in imports, name); return imports[name]; },
    fetch: async (input: URL, init: RequestInit) => {
        const url = new URL(input); requests.push(url);
        assert.equal((init.headers as Record<string, string>).Authorization, "Bearer test-token");
        assert.equal(init.cache, "no-store"); assert.ok(init.signal);
        const by = url.searchParams.getAll("by");
        assert.equal(by.length, 2, "dimensions must be repeated query parameters");
        assert.equal(url.searchParams.get("filter"), "environment eq 'production'");
        const until = new Date(Math.ceil(Date.parse(url.searchParams.get("until")!) / 3_600_000) * 3_600_000).toISOString();
        return { ok: !failApi, status: failApi ? 403 : 200, json: async () => ({
            query: { since: badRange ? "2026-10-01T00:00:00.000Z" : url.searchParams.get("since"), until, groupBy: badGrouping ? [] : by.filter(key => key !== "hour") },
            data: [{ ...Object.fromEntries(by.map(key => [key === "hour" ? "timestamp" : key, "sample"])), pageviews: 2, visitors: 1, unexpectedSecret: "must-not-be-saved" }],
        }) };
    },
});
const service = result as typeof Backup;
const plain = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

assert.equal(service.dayStart("2026-10-30"), Date.parse("2026-10-29T15:00:00Z"));
assert.throws(() => service.dayStart("2026-02-30"), /invalid_start_date/);
assert.throws(() => service.dayStart("2026-2-3"), /invalid_start_date/);
assert.deepEqual(plain(service.archiveDays("2026-10-30", "2026-10-30", new Set())), []);
assert.deepEqual(plain(service.archiveDays("2026-11-02", "2026-10-30", new Set())), ["2026-11-01", "2026-10-31", "2026-10-30"]);
assert.deepEqual(plain(service.archiveDays("2026-11-10", "2026-10-30", new Set(["2026-10-30"]))), ["2026-11-09", "2026-11-08", "2026-11-07", "2026-10-31"]);
assert.equal(service.archiveDays("2026-12-15", "2026-10-30", new Set()).at(-1), "2026-11-17");
const url = service.reportQuery("project", "team", "2026-10-30", service.dayStart("2026-10-31"), "pagesAndReferrers");
assert.equal(url.searchParams.get("since"), "2026-10-29T15:00:00.000Z");
assert.equal(url.searchParams.get("until"), "2026-10-30T14:59:59.999Z");
assert.deepEqual(url.searchParams.getAll("by"), ["requestPath", "referrerHostname"]);
assert.throws(() => service.parseReport({}, "pagesAndReferrers"), /invalid_api_response/);
assert.equal(service.analyticsBackupFailure(new Error("sensitive error" )).error, "analytics_backup_failed");

const now = new Date("2026-11-01T03:00:00Z");
const run = await service.backupAnalytics(now);
assert.equal(run.ok, true); assert.equal(run.snapshotSaved, true);
assert.deepEqual(plain(run.saved), ["2026-10-31", "2026-10-30"]);
assert.equal(uploads.size, 3); assert.equal(requests.length, 9);
const completed = JSON.parse(uploads.get("daily/2026-10/2026-10-30.json")!);
assert.equal(completed.completeDay, true); assert.equal(completed.timeZone, "Asia/Seoul");
assert.equal(JSON.parse(uploads.get("latest.json")!).completeDay, false);
assert.ok(!JSON.stringify(completed).includes("must-not-be-saved"));
const prior = uploads.get("daily/2026-10/2026-10-30.json");
await service.backupAnalytics(now);
assert.equal(uploads.size, 3, "retries update the same daily files");
assert.equal(uploads.get("daily/2026-10/2026-10-30.json"), prior);
failApi = true;
const denied = await service.backupAnalytics(now);
assert.equal(denied.ok, false); assert.equal(denied.saved.length, 0);
assert.equal(denied.failed[0].code, "analytics_http_403");
assert.equal(uploads.get("daily/2026-10/2026-10-30.json"), prior, "API failure must not overwrite a good archive");
failApi = false; badGrouping = true;
assert.equal((await service.backupAnalytics(now)).failed[0].code, "unexpected_api_grouping");
badGrouping = false; badRange = true;
assert.equal((await service.backupAnalytics(now)).failed[0].code, "unexpected_api_date_range");
badRange = false; failUpload = true;
assert.equal((await service.backupAnalytics(now)).failed[0].code, "archive_upload_failed");
failUpload = false; failList = true;
await assert.rejects(service.backupAnalytics(now), /archive_listing_failed/);
failList = false; publicBucket = true;
await assert.rejects(service.backupAnalytics(now), /private_bucket_required/);
publicBucket = false; delete env.VERCEL_ANALYTICS_TOKEN;
await assert.rejects(service.backupAnalytics(now), /missing_VERCEL_ANALYTICS_TOKEN/);
console.log("PASS: KST boundaries, month crossing, recovery window, start date, repeated dimensions, field allowlist, idempotent archive, API/range/upload failure preservation, private bucket, missing token");
