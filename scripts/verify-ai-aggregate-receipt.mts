/** Focused actual HTTP + Prisma check using ONLY the original aggregate migration. */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { emptyTotals, ingestSchema, type UsageYear } from "../src/lib/ai-usage";
const dir = mkdtempSync(join(tmpdir(), "mublog-aggregate-receipt-"));
const db = new PGlite();
await db.exec(readFileSync("prisma/migrations/20260930000000_ai_dashboard/migration.sql", "utf8"));
const socket = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 0 });
await socket.start();
const databaseUrl = `postgresql://postgres:postgres@${socket.getServerConn()}/postgres?sslmode=disable`;
const probe = createServer(); await new Promise<void>(r => probe.listen(0, "127.0.0.1", r));
const port = (probe.address() as { port: number }).port;
await new Promise<void>(r => probe.close(() => r()));
const key = "synthetic-aggregate-key-not-a-real-secret";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl, AI_USAGE_DELIVERY_MODE: "legacy", AI_USAGE_INGEST_KEY: key, AI_USAGE_DEVICE_KEYS: "{}", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:9", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-publishable-key", NEXT_TELEMETRY_DISABLED: "1" },
    detached: true, stdio: ["ignore", "pipe", "pipe"],
});
const serverLog = createWriteStream(join(dir, "server.log"));
child.stdout.pipe(serverLog, { end: false }); child.stderr.pipe(serverLog, { end: false });
let ready = false; child.stdout.on("data", b => { if (String(b).includes("Ready in")) ready = true; });
const totals = { ...emptyTotals(), input: 100, output: 20, total: 120, non_cache_read_input: 100, responses: 1 };
const diagnosticNames = ["calls", "outputs", "output_chars", "large_outputs", "truncations", "repeated_calls", "known_failed_outputs", "unknown_output_outcomes", "kb_searches", "kb_empty_searches", "kb_selections", "kb_applications", "kb_search_mentions", "compactions"];
const year: UsageYear = { year: 2026, weeks: [{ week: "2026-09-28", ended: false, observed: true, partial: true, totals, groups: [{ project: "PRIVATE_PROJECT", tool: "Codex", model: "PRIVATE_MODEL", effort: "PRIVATE_EFFORT", totals }], states: { unclassified: totals }, diagnostics: Object.fromEntries(diagnosticNames.map(k => [k, 0])) }], devices: [{ device: "PRIVATE_DEVICE", since: "2026-09-28T00:00:00Z", until: "2026-09-30T00:00:00Z" }], tasks: [], quality: { problems: [], fallback_identities: 0, task_conflicts: 0, ambiguous_task_responses: 0, comparison: "withheld" }, fieldObservations: {} };
const envelope = (sequence: number, revision: string, years = [year]) => ingestSchema.parse({ schema: 1, metrics: "usage-v1", sequence, sourceRevision: revision.repeat(40), generatedAt: "2026-10-01T00:00:00Z", years, improvements: [] });
const samples: unknown[] = [];
async function send(body: ReturnType<typeof envelope>, authorized = true) {
    const response = await fetch(`http://127.0.0.1:${port}/api/internal/ai-usage`, { method: "POST", headers: { "content-type": "application/json", ...(authorized ? { authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(60_000) });
    const ack = await response.json();
    samples.push({ request: { sequence: body.sequence, sourceRevision: body.sourceRevision }, status: response.status, response: ack });
    return { status: response.status, ack };
}
try {
    for (let i = 0; !ready && i < 120; i++) { if (child.exitCode !== null) throw new Error(`Local server exited; ${dir}/server.log`); await delay(500); }
    assert.ok(ready, `Local server not ready; ${dir}/server.log`);
    assert.equal((await send(envelope(10, "a"), false)).status, 401);
    const applied = await send(envelope(10, "a"));
    assert.equal(applied.status, 200); assert.deepEqual(applied.ack, { accepted: true, sequence: 10, sourceRevision: "a".repeat(40) });
    for (const [sequence, revision] of [[10, "a"], [9, "b"], [10, "b"]] as const) {
        const result = await send(envelope(sequence, revision)); assert.equal(result.status, 200);
        assert.deepEqual(result.ack, { accepted: false, sequence: 10, sourceRevision: "a".repeat(40) });
    }
    // A newer revision confined to another year must still win the global maximum receipt.
    const oldYear = { ...year, year: 2025, weeks: [{ ...year.weeks[0], week: "2025-09-29" }] };
    assert.deepEqual((await send(envelope(12, "c", [oldYear]))).ack, { accepted: true, sequence: 12, sourceRevision: "c".repeat(40) });
    assert.deepEqual((await send(envelope(11, "d"))).ack, { accepted: false, sequence: 12, sourceRevision: "c".repeat(40) });
    // A later-year write failure rolls back every year and cannot produce a success ACK.
    await db.exec("alter table ai_usage_snapshots add constraint synthetic_year_limit check (year <> 2024)");
    const failingYear = { ...year, year: 2024, weeks: [{ ...year.weeks[0], week: "2024-09-30" }] };
    assert.equal((await send(envelope(13, "e", [year, failingYear]))).status, 500);
    assert.deepEqual((await send(envelope(11, "d"))).ack, { accepted: false, sequence: 12, sourceRevision: "c".repeat(40) });
    const rows = (await db.query<{ year: number; sequence: bigint; source_revision: string; public_data: unknown; private_data: unknown }>("select * from ai_usage_snapshots order by year")).rows;
    assert.deepEqual(rows.map(r => [r.year, Number(r.sequence)]), [[2025, 12], [2026, 10]]);
    assert.ok(rows.every(r => !JSON.stringify(r.public_data).includes("PRIVATE")));
    assert.ok(rows.every(r => JSON.stringify(r.private_data).includes("PRIVATE_PROJECT")));
    assert.equal((await db.query("select column_name from information_schema.columns where table_name='ai_usage_snapshots' and column_name='source'")).rows.length, 0);
    assert.equal((await db.query("select tablename from pg_tables where schemaname='public' and tablename like 'ai_usage_device%'")).rows.length, 0);
    writeFileSync("scripts/fixtures/ai-aggregate-receipt-server.json", JSON.stringify(samples, null, 2) + "\n");
    // PGlite exposes one DB session; release the HTTP server's pool before a second Prisma client.
    if (child.pid) process.kill(-child.pid, "SIGTERM");
    await new Promise<void>(resolve => child.once("exit", () => resolve()));
    await delay(500);
    process.env.DATABASE_URL = databaseUrl;
    const { getAdminAi } = await import("../src/lib/ai-usage-data");
    const { prisma } = await import("../src/lib/prisma");
    try { assert.equal((await getAdminAi()).snapshots.length, 2); } finally { await prisma.$disconnect(); }
    console.log(`PASS: actual HTTP ACK/apply/duplicate/lower/same-sequence-different-revision/global maximum/atomic rollback; old schema without raw migration; admin read/public projection. Server log: ${dir}/server.log`);
} finally {
    if (child.pid) { try { process.kill(-child.pid, "SIGTERM"); } catch { /* already stopped */ } }
    await delay(500); serverLog.end(); await socket.stop(); await db.close();
}
