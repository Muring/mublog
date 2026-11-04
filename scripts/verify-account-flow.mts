import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { handleAccounts, type AccountConfig } from "../src/lib/accounts/core";
const config: AccountConfig = {
  url: "https://supabase.test",
  key: "public-test",
  secret: "secret-test",
  origin: "https://app.test",
  enabled: true,
};
const token =
  "header." +
  Buffer.from(JSON.stringify({ session_id: "session-1" })).toString(
    "base64url",
  ) +
  ".signature";
const calls: { path: string; body: Record<string, unknown> }[] = [];
let exchanged = false;
const fetcher: typeof fetch = async (input, init) => {
  const path = String(input);
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  calls.push({ path, body });
  if (path.endsWith("/auth/v1/user"))
    return Response.json({ id: exchanged ? "second-user" : "first-user" });
  if (path.includes("/auth/v1/token")) {
    exchanged = true;
    return Response.json({
      access_token: "second-token",
      refresh_token: "must-never-reach-browser",
    });
  }
  if (path.endsWith("/account_context"))
    return Response.json({ id: "first-user", name: "Name", providers: [] });
  return Response.json(
    body.p_action === "prove" ? { verified: true } : { id: body.p_id },
  );
};
const req = (
  op: string,
  method = "GET",
  body?: unknown,
  cookie?: string,
  origin = config.origin,
) =>
  new Request(config.origin + "/api/accounts?" + op, {
    method,
    headers: { origin, ...(cookie ? { cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const run = (r: Request) =>
  handleAccounts(r, config, async () => token, fetcher);
assert.equal((await run(req("op=start"))).status, 405);
assert.equal(calls.length, 0);
assert.equal(
  (
    await run(
      req(
        "op=start",
        "POST",
        { provider: "google" },
        undefined,
        "https://evil.test",
      ),
    )
  ).status,
  403,
);
assert.equal(calls.length, 0);
assert.equal(
  (await handleAccounts(req("op=status"), config, async () => null, fetcher))
    .status,
  401,
);
const start = await run(req("op=start", "POST", { provider: "google" }));
assert.equal(start.status, 200);
const cookie = start.headers.get("set-cookie")!.split(";")[0];
assert.match(start.headers.get("set-cookie")!, /HttpOnly; SameSite=Lax/);
assert.match(start.headers.get("set-cookie")!, /Secure/);
const authorization = new URL((await start.json()).url);
assert.equal(authorization.searchParams.get("provider"), "google");
assert.equal(authorization.searchParams.get("code_challenge_method"), "s256");
const callback = new URL(authorization.searchParams.get("redirect_to")!);
const id = callback.searchParams.get("connection")!;
const started = calls.find((c) => c.body.p_action === "start")!.body;
assert.equal(started.p_auth, "first-user");
assert.equal(started.p_session, "session-1");
assert.equal(String(started.p_binding).length, 64);
const bad = await run(
  req("op=callback&connection=wrong&code=code", "GET", undefined, cookie),
);
assert.equal(bad.status, 303);
assert.match(bad.headers.get("location")!, /connection_expired/);
assert.equal(exchanged, false);
const completed = await run(
  req("op=callback&connection=" + id + "&code=code", "GET", undefined, cookie),
);
assert.equal(completed.status, 303);
assert.equal(
  completed.headers.get("location"),
  config.origin + "/?link=review",
);
assert.equal(
  completed.headers.get("set-cookie"),
  null,
  "Secondary auth cookies must never replace the primary session",
);
assert.equal(
  calls.find((c) => c.body.p_action === "prove")!.body.p_auth,
  "first-user",
);
assert.equal(
  (
    calls.find((c) => c.body.p_action === "prove")!.body.p_payload as {
      target: string;
    }
  ).target,
  "second-user",
);
assert.equal(
  (
    await handleAccounts(
      req("op=start", "POST", {}),
      { ...config, enabled: false },
      async () => token,
      fetcher,
    )
  ).status,
  503,
);
// Deployable copies must speak exactly the same protocol.
for (const repo of ["dice-dungeon", "bulmeong"]) {
  assert.equal(
    readFileSync(
      new URL(`../../${repo}/server/accounts-core.ts`, import.meta.url),
      "utf8",
    ),
    readFileSync(
      new URL("../src/lib/accounts/core.ts", import.meta.url),
      "utf8",
    ),
  );
  for (const asset of ["account-settings.js", "account-settings.css"])
    assert.equal(
      readFileSync(
        new URL(`../../${repo}/public/${asset}`, import.meta.url),
        "utf8",
      ),
      readFileSync(new URL(`../public/${asset}`, import.meta.url), "utf8"),
    );
}
console.log(
  "PASS account flow: method/origin gates, session validation, PKCE, callback binding, isolated login cookies, disabled rollout and cross-app parity",
);
