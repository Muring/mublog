/** Framework-neutral account-link protocol. SQL owns merge semantics in all apps. */
export interface AccountConfig {
  url: string;
  key: string;
  secret: string;
  origin: string;
  enabled: boolean;
  settingsPath?: string;
  unified?: boolean;
}
export interface AccountContext {
  id: string;
  name: string;
  avatar: string | null;
  email: string | null;
  version: number;
  members: string[];
  providers: { provider: string; email: string | null }[];
}
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const str = (v: unknown) => (typeof v === "string" ? v : "");
const COOKIE = "account_connection";
const encode = (v: string) =>
  btoa(v).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const decode = (v: string) => atob(v.replace(/-/g, "+").replace(/_/g, "/"));
const random = () =>
  encode(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
const sha = async (v: string) =>
  new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)),
  );
export function cookieValue(header: string | null, name: string): string {
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1));
      } catch {
        return "";
      }
    }
  }
  return "";
}
export class AccountError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export async function accountRpc(
  config: Pick<AccountConfig, "url" | "secret">,
  name: string,
  body: unknown,
  transport: typeof fetch = fetch,
): Promise<unknown> {
  const response = await transport(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: config.secret,
      "Content-Type": "application/json",
      ...(config.secret.split(".").length === 3
        ? { Authorization: `Bearer ${config.secret}` }
        : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const known = [
      "account_reload_required",
      "preview_changed",
      "save_choice_required",
      "start_as_admin",
      "provider_conflict",
      "provider_connected",
      "connection_expired",
      "proof_already_used",
      "second_login_required",
      "unsupported_provider",
      "record_schema_requires_upgrade",
      "too_many_attempts",
      "account_missing",
    ];
    const code = known.find((x) => str(obj(data).message) === x);
    throw new AccountError(
      code === "too_many_attempts" ? 429 : code ? 409 : 503,
      code ?? "service_unavailable",
    );
  }
  return data;
}
export async function resolveAccount(
  config: Pick<AccountConfig, "url" | "secret">,
  authId: string,
): Promise<AccountContext> {
  const result = await accountRpc(config, "account_context", {
    p_auth: authId,
  });
  if (!obj(result).id) throw new AccountError(503, "account_missing");
  return result as AccountContext;
}
export async function handleAccounts(
  request: Request,
  config: AccountConfig,
  getToken: () => Promise<string | null>,
  transport: typeof fetch = fetch,
): Promise<Response> {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  const json = (body: unknown, status = 200) =>
    Response.json(body, { status, headers });
  const clear = () =>
    headers.append(
      "Set-Cookie",
      `${COOKIE}=; Path=/api/accounts; HttpOnly; SameSite=Lax; Max-Age=0${config.origin.startsWith("https:") ? "; Secure" : ""}`,
    );
  const redirect = (suffix: string) => {
    headers.set(
      "Location",
      config.origin + (config.settingsPath ?? "/") + suffix,
    );
    return new Response(null, { status: 303, headers });
  };
  try {
    const origin = new URL(config.origin);
    if (
      origin.origin !== config.origin ||
      (origin.protocol !== "https:" &&
        !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname))
    )
      throw new AccountError(503, "service_unavailable");
    const url = new URL(request.url),
      action = url.searchParams.get("op") ?? "status";
    const methods: Record<string, string> = {
      status: "GET",
      start: "POST",
      callback: "GET",
      preview: "GET",
      confirm: "POST",
      cancel: "POST",
    };
    if (!Object.hasOwn(methods, action))
      return json({ error: "not_found" }, 404);
    if (request.method !== methods[action])
      return json({ error: "method_not_allowed" }, 405);
    if (
      request.method === "POST" &&
      request.headers.get("origin") !== config.origin
    )
      return json({ error: "invalid_origin" }, 403);
    if (!config.enabled && action !== "status")
      return json({ error: "linking_disabled" }, 503);
    const token = await getToken();
    if (!token) return json({ error: "login_required" }, 401);
    const authenticated = async (access: string) => {
      const r = await transport(config.url + "/auth/v1/user", {
        headers: { apikey: config.key, Authorization: `Bearer ${access}` },
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      });
      if (!r.ok)
        throw new AccountError(
          r.status === 401 || r.status === 403 ? 401 : 503,
          r.status === 401 || r.status === 403
            ? "login_required"
            : "service_unavailable",
        );
      return obj(await r.json());
    };
    const user = await authenticated(token);
    const authId = str(user.id);
    // Decode only after getUser has remotely validated this exact token.
    let session = "";
    try {
      session = str(obj(JSON.parse(decode(token.split(".")[1]))).session_id);
    } catch {
      /* invalid token */
    }
    if (!authId || !session) throw new AccountError(401, "login_required");
    if (action === "status") {
      if (!config.unified && !config.enabled) {
        const metadata = obj(user.user_metadata);
        const identities = Array.isArray(user.identities)
          ? user.identities.map(obj)
          : [];
        const providers = identities
          .filter((i) => i.provider === "google" || i.provider === "github")
          .map((i) => ({
            provider: i.provider,
            email: obj(i.identity_data).email ?? null,
          }));
        return json({
          enabled: false,
          account: {
            id: authId,
            name:
              metadata.user_name ??
              metadata.full_name ??
              metadata.name ??
              "계정",
            avatar: metadata.avatar_url ?? metadata.picture ?? null,
            providers,
          },
        });
      }
      const account = await accountRpc(
        config,
        "account_context",
        { p_auth: authId },
        transport,
      );
      if (!obj(account).id) throw new AccountError(503, "account_missing");
      return json({ enabled: config.enabled, account });
    }
    let payload: Record<string, unknown> = {};
    if (request.method === "POST") {
      const raw = await request.text();
      if (raw.length > 4096) return json({ error: "request_too_large" }, 413);
      try {
        payload = obj(JSON.parse(raw));
      } catch {
        return json({ error: "invalid_request" }, 400);
      }
    }
    let proof: Record<string, unknown> = {};
    try {
      proof = obj(
        JSON.parse(decode(cookieValue(request.headers.get("cookie"), COOKIE))),
      );
    } catch {
      /* absent cookie */
    }
    let id = str(proof.id),
      binding = str(proof.binding),
      verifier = str(proof.verifier);
    if (action === "start") {
      if (payload.provider !== "github" && payload.provider !== "google")
        return json({ error: "invalid_provider" }, 400);
      id = crypto.randomUUID();
      binding = random();
      verifier = random();
    }
    if (
      !/^[\da-f-]{36}$/i.test(id) ||
      binding.length !== 43 ||
      verifier.length !== 43
    )
      throw new AccountError(409, "connection_expired");
    const bindingHash = Array.from(await sha(binding), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    const call = (step: string, data: unknown = {}) =>
      accountRpc(
        config,
        "account_connection",
        {
          p_action: step,
          p_auth: authId,
          p_session: session,
          p_origin: config.origin,
          p_id: id,
          p_binding: bindingHash,
          p_payload: data,
        },
        transport,
      );
    if (action === "start") {
      await call("start", { provider: payload.provider });
      headers.append(
        "Set-Cookie",
        `${COOKIE}=${encode(JSON.stringify({ id, binding, verifier }))}; Path=/api/accounts; HttpOnly; SameSite=Lax; Max-Age=600${origin.protocol === "https:" ? "; Secure" : ""}`,
      );
      const authorize = new URL(config.url + "/auth/v1/authorize");
      authorize.search = new URLSearchParams({
        provider: String(payload.provider),
        redirect_to:
          config.origin + "/api/accounts?op=callback&connection=" + id,
        code_challenge: encode(String.fromCharCode(...(await sha(verifier)))),
        code_challenge_method: "s256",
      }).toString();
      return json({ url: authorize.href });
    }
    if (action === "callback") {
      if (url.searchParams.get("connection") !== id)
        throw new AccountError(409, "connection_expired");
      if (url.searchParams.has("error") || !url.searchParams.get("code")) {
        await call("cancel");
        clear();
        return redirect("?link=cancelled");
      }
      const exchange = await transport(
        config.url + "/auth/v1/token?grant_type=pkce",
        {
          method: "POST",
          headers: { apikey: config.key, "Content-Type": "application/json" },
          body: JSON.stringify({
            auth_code: url.searchParams.get("code"),
            code_verifier: verifier,
          }),
          signal: AbortSignal.timeout(10000),
          cache: "no-store",
        },
      );
      if (!exchange.ok) throw new AccountError(409, "oauth_failed");
      const credentials = obj(await exchange.json());
      const target = await authenticated(str(credentials.access_token));
      await call("prove", { target: target.id });
      // The second session is deliberately never installed into the browser.
      return redirect("?link=review");
    }
    const data = await call(
      action,
      action === "confirm"
        ? { fingerprint: payload.fingerprint, saveChoice: payload.saveChoice }
        : {},
    );
    if (action === "cancel" || obj(data).complete) clear();
    return json(data);
  } catch (error) {
    const status = error instanceof AccountError ? error.status : 503;
    const code =
      error instanceof AccountError ? error.code : "service_unavailable";
    if (new URL(request.url).searchParams.get("op") === "callback") {
      clear();
      return redirect("?link=" + encodeURIComponent(code));
    }
    return json({ error: code }, status);
  }
}
