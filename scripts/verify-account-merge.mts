import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
// Fixture queries have intentionally varied row shapes.
/* eslint-disable @typescript-eslint/no-explicit-any */
const db = new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
create table auth.users(id uuid primary key,email text);
create table auth.identities(id uuid primary key,user_id uuid references auth.users,provider text,identity_data jsonb);
create table profiles(id uuid primary key references auth.users,github_id text unique,username text,avatar_url text,role text default 'USER',created_at timestamptz default now());
create table posts(id text primary key,author_id uuid references profiles);
create table comments(id text primary key,author_id uuid references profiles,deleted_by uuid);
create table post_likes(post_id text,user_id uuid references profiles,primary key(post_id,user_id));
create table comment_likes(comment_id text,user_id uuid references profiles,primary key(comment_id,user_id));
create table dice_results(run_id uuid primary key,user_id uuid references auth.users);
create table dice_achievements(user_id uuid references auth.users,achievement_id text,earned_at timestamptz,rules_version text,condition_version int,run_id uuid,primary key(user_id,achievement_id));
create table dice_achievement_profiles(user_id uuid primary key references auth.users,selected_title text,full_kit int);
create table bulmeong_saves(user_id uuid primary key references auth.users,data jsonb,updated_at timestamptz);
`);
await db.exec(
  readFileSync(
    new URL(
      "../prisma/migrations/20261104120000_account_unification/migration.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
const a = "10000000-0000-4000-8000-000000000001",
  b = "10000000-0000-4000-8000-000000000002",
  c = "10000000-0000-4000-8000-000000000003";
const op = "20000000-0000-4000-8000-000000000001";
for (const [id, provider] of [
  [a, "github"],
  [b, "google"],
  [c, "github"],
]) {
  await db.query<Record<string, any>>("insert into auth.users values($1,$2)", [
    id,
    provider + "@example.test",
  ]);
  await db.query<Record<string, any>>(
    "insert into profiles(id,username) values($1,$2)",
    [id, provider],
  );
  await db.query<Record<string, any>>(
    "insert into auth.identities values($1,$1,$2,$3)",
    [id, provider, { email: provider + "@example.test" }],
  );
}
await db.query<Record<string, any>>(
  "update profiles set role='ADMIN' where id=$1",
  [a],
);
await db.query<Record<string, any>>("insert into posts values('post',$1)", [b]);
await db.query<Record<string, any>>(
  "insert into post_likes values('post',$1),('post',$2)",
  [a, b],
);
await db.query<Record<string, any>>(
  "insert into dice_achievements values($1,'class-mage','2026-01-02','v3',1,$1),($2,'class-mage','2026-01-01','v3',1,$2)",
  [a, b],
);
await db.query<Record<string, any>>(
  'insert into bulmeong_saves values($1,\'{"shelter":1,"charcoal":10}\',now()),($2,\'{"shelter":3,"charcoal":20}\',now())',
  [a, b],
);
const call = async (
  action: string,
  payload: unknown = {},
  who = a,
  operation = op,
  session = "session",
) =>
  (
    await db.query<{ result: Record<string, unknown> }>(
      "select account_connection($1,$2,$3,$4,$5,$6,$7) result",
      [
        action,
        who,
        session,
        "https://app.test",
        operation,
        "a".repeat(64),
        payload,
      ],
    )
  ).rows[0].result;
await call("start", { provider: "google" });
await assert.rejects(
  call("prove", { target: b }, a, op, "other"),
  /connection_expired/,
);
await call("prove", { target: b });
await assert.rejects(call("prove", { target: b }), /proof_already_used/);
let preview = await call("preview");
await assert.rejects(
  call("confirm", { fingerprint: preview.fingerprint }),
  /save_choice_required/,
);
await db.query<Record<string, any>>(
  "update bulmeong_saves set data='{\"shelter\":4}' where user_id=$1",
  [b],
);
await assert.rejects(
  call("confirm", {
    fingerprint: preview.fingerprint,
    saveChoice: "secondary",
  }),
  /preview_changed/,
);
preview = await call("preview");
await call("confirm", {
  fingerprint: preview.fingerprint,
  saveChoice: "secondary",
});
assert.equal((await call("confirm")).complete, true);
assert.equal(
  (await db.query<Record<string, any>>("select account_id($1) id", [b])).rows[0]
    .id,
  a,
);
assert.equal(
  (await db.query<Record<string, any>>("select count(*) n from post_likes"))
    .rows[0].n,
  1,
);
assert.equal(
  (await db.query<Record<string, any>>("select data from bulmeong_saves"))
    .rows[0].data.shelter,
  4,
);
assert.equal(
  (
    await db.query<Record<string, any>>(
      "select account_version from profiles where id=$1",
      [a],
    )
  ).rows[0].account_version,
  1,
);
assert.equal(
  (await db.query<Record<string, any>>("select count(*) n from auth.users"))
    .rows[0].n,
  3,
);
assert.equal(
  (
    await db.query<Record<string, any>>(
      "select to_char(earned_at,'YYYY-MM-DD') d from dice_achievements",
    )
  ).rows[0].d,
  "2026-01-01",
);
await assert.rejects(
  db.query("select account_save($1,0,$2)", [b, {}]),
  /account_reload_required/,
);
// Late writes carrying the former owner resolve to the unified profile.
await db.query<Record<string, any>>(
  "insert into comments values('late',$1,$1)",
  [b],
);
assert.equal(
  (
    await db.query<Record<string, any>>(
      "select author_id from comments where id='late'",
    )
  ).rows[0].author_id,
  a,
);
// Private routines and tables must not be callable by public clients.
assert.equal(
  (
    await db.query<Record<string, any>>(
      "select has_function_privilege('anon','account_context(uuid)','execute') allowed",
    )
  ).rows[0].allowed,
  false,
);
assert.equal(
  (
    await db.query<Record<string, any>>(
      "select has_table_privilege('authenticated','account_memberships','select') allowed",
    )
  ).rows[0].allowed,
  false,
);
// Verify the known personal-record schema and administrator/provider conflicts.
await db.exec(
  readFileSync(
    new URL(
      "../prisma/migrations/20261104110000_bulmeong_personal_records/migration.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
const d = "10000000-0000-4000-8000-000000000004",
  op2 = "20000000-0000-4000-8000-000000000002";
await db.query("insert into auth.users values($1,$2)", [
  d,
  "google-2@example.test",
]);
await db.query(
  "insert into profiles(id,username,role) values($1,'second','ADMIN')",
  [d],
);
await db.query("insert into auth.identities values($1,$1,'google','{}')", [d]);
await call("start", { provider: "google" }, c, op2);
await call("prove", { target: d }, c, op2);
await assert.rejects(call("preview", {}, c, op2), /start_as_admin/);
await db.query("update profiles set role='USER' where id=$1", [d]);
await db.query(
  "insert into auth.identities values('99999999-0000-4000-8000-000000000001',$1,'github','{}')",
  [d],
);
await assert.rejects(call("preview", {}, c, op2), /provider_conflict/);
await db.query(
  "delete from auth.identities where id='99999999-0000-4000-8000-000000000001'",
);
await db.query(
  "insert into bulmeong_saves values($1,'{\"shelter\":1}',now()),($2,'{\"shelter\":2}',now())",
  [c, d],
);
await db.query(
  "insert into bulmeong_record_totals(user_id,totals) values($1,'{\"playSeconds\":1}'),($2,'{\"playSeconds\":20}')",
  [c, d],
);
await db.query(
  "insert into bulmeong_record_batches values($1,$1,'{\"playSeconds\":1}'),($2,$2,'{\"playSeconds\":20}')",
  [c, d],
);
const secondPreview = await call("preview", {}, c, op2);
await call(
  "confirm",
  { fingerprint: secondPreview.fingerprint, saveChoice: "secondary" },
  c,
  op2,
);
const totals = (
  await db.query<{ totals: { playSeconds: number } }>(
    "select totals from bulmeong_record_totals where user_id=$1",
    [c],
  )
).rows[0].totals;
assert.equal(totals.playSeconds, 20);
assert.equal(
  (
    await db.query<{ n: number }>(
      "select count(*)::int n from bulmeong_record_batches where user_id=$1",
      [c],
    )
  ).rows[0].n,
  1,
);
// A failure after the first ownership transfers must roll the entire transaction back.
const e = "10000000-0000-4000-8000-000000000005",
  f = "10000000-0000-4000-8000-000000000006",
  op3 = "20000000-0000-4000-8000-000000000003";
for (const [id, provider] of [
  [e, "github"],
  [f, "google"],
]) {
  await db.query("insert into auth.users values($1,$2)", [
    id,
    "rollback@example.test",
  ]);
  await db.query("insert into profiles(id,username) values($1,'rollback')", [
    id,
  ]);
  await db.query("insert into auth.identities values($1,$1,$2,$3)", [
    id,
    provider,
    {},
  ]);
}
await db.query("insert into posts values('rollback-post',$1)", [f]);
await call("start", { provider: "google" }, e, op3);
await call("prove", { target: f }, e, op3);
const rollbackPreview = await call("preview", {}, e, op3);
await db.exec(
  "create function reject_merge() returns trigger language plpgsql as $$ begin raise exception 'simulated_failure'; end $$; create trigger reject_merge before insert on account_merge_audit for each row execute function reject_merge();",
);
await assert.rejects(
  call("confirm", { fingerprint: rollbackPreview.fingerprint }, e, op3),
  /simulated_failure/,
);
assert.equal(
  (
    await db.query<{ author_id: string }>(
      "select author_id from posts where id='rollback-post'",
    )
  ).rows[0].author_id,
  f,
);
assert.equal(
  (await db.query<{ id: string }>("select account_id($1) id", [f])).rows[0].id,
  f,
);
await db.exec("drop trigger reject_merge on account_merge_audit");
await db.query(
  "update account_connections set expires_at=now()-interval '1 second' where id=$1",
  [op3],
);
await assert.rejects(call("preview", {}, e, op3), /connection_expired/);
console.log(
  "PASS account merge: dual proof, binding, replay, preview conflict, save choice, idempotence, data union, canonical writes, stale versions and ACL",
);
await db.close();
