/**
 * .env 의 접속 정보가 올바른지 확인한다.
 *   yarn check:db
 *
 * 비밀번호는 출력하지 않는다.
 */
import { loadEnvFile } from "node:process";
import pg from "pg";

try {
    loadEnvFile(".env");
} catch {
    console.error("FAIL  .env 파일이 없습니다.");
    process.exit(1);
}

type Target = { label: string; envKey: string; expectedPort: string };

const targets: Target[] = [
    { label: "DATABASE_URL  (Transaction pooler / 앱 런타임)", envKey: "DATABASE_URL", expectedPort: "6543" },
    { label: "DIRECT_URL    (Session pooler / 마이그레이션)", envKey: "DIRECT_URL", expectedPort: "5432" },
];

let failed = 0;

for (const { label, envKey, expectedPort } of targets) {
    const raw = process.env[envKey];
    console.log(`\n── ${label}`);

    if (!raw) {
        console.log("   FAIL  값이 비어 있습니다.");
        failed++;
        continue;
    }

    // 흔한 실수부터 걸러낸다 (접속을 시도하기 전에)
    if (raw.includes("PLACEHOLDER")) {
        console.log("   FAIL  아직 PLACEHOLDER 값입니다. Supabase 값으로 교체하세요.");
        failed++;
        continue;
    }
    if (/\[YOUR-PASSWORD\]|\[YOUR_PASSWORD\]/i.test(raw)) {
        console.log("   FAIL  [YOUR-PASSWORD] 자리표시자가 그대로 남아 있습니다.");
        failed++;
        continue;
    }

    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        console.log("   FAIL  URL 형식이 아닙니다.");
        failed++;
        continue;
    }

    console.log(`   host  ${url.hostname}`);
    console.log(`   port  ${url.port}`);
    console.log(`   user  ${url.username}`);

    if (url.port !== expectedPort) {
        console.log(`   WARN  포트가 ${expectedPort} 이어야 합니다. 풀러 종류를 잘못 복사했을 수 있습니다.`);
    }
    if (envKey === "DATABASE_URL" && !raw.includes("pgbouncer=true")) {
        console.log("   WARN  ?pgbouncer=true 가 없습니다. 동시 요청 시 간헐적 오류가 납니다.");
    }
    if (envKey === "DIRECT_URL" && url.hostname.startsWith("db.")) {
        console.log("   WARN  db.<ref>.supabase.co 는 IPv6 전용입니다. Session pooler 주소를 쓰세요.");
    }

    const client = new pg.Client({ connectionString: raw, connectionTimeoutMillis: 10_000 });
    try {
        await client.connect();
        const { rows } = await client.query("select current_database() as db, version() as v");
        console.log(`   OK    접속 성공 (db=${rows[0].db})`);
        console.log(`         ${String(rows[0].v).split(",")[0]}`);
    } catch (err) {
        const message = (err as Error).message;
        console.log(`   FAIL  ${message}`);
        if (/password authentication failed/i.test(message)) {
            console.log("         → 비밀번호가 틀렸거나 특수문자 URL 인코딩이 안 됐습니다.");
            console.log("           @ → %40,  # → %23,  / → %2F,  ? → %3F,  : → %3A");
        } else if (/ENOTFOUND|EAI_AGAIN/.test(message)) {
            console.log("         → 호스트 주소를 다시 확인하세요.");
        } else if (/ETIMEDOUT|ECONNREFUSED/.test(message)) {
            console.log("         → 포트가 맞는지, 프로젝트가 일시정지 상태가 아닌지 확인하세요.");
        }
        failed++;
    } finally {
        await client.end().catch(() => {});
    }
}

// 나머지 환경변수 점검.
// 값 자체는 절대 출력하지 않는다. 접속 문자열에는 비밀번호가 들어 있다.
const others: { key: string; usedBy: string }[] = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", usedBy: "로그인/에디터" },
    { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", usedBy: "로그인/에디터" },
    { key: "SUPABASE_SECRET_KEY", usedBy: "이미지 업로드" },
    { key: "NEXT_PUBLIC_SITE_URL", usedBy: "OAuth 콜백" },
    { key: "CRON_SECRET", usedBy: "방문자 트래킹 keepalive" },
];

console.log("\n-- 나머지 환경변수");
const pending: string[] = [];
for (const { key, usedBy } of others) {
    const value = process.env[key] ?? "";
    const unfilled = !value || /[<>]|PLACEHOLDER|여기에|\.\.\./.test(value);
    if (unfilled) pending.push(`${key}  (${usedBy})`);
    console.log(`   ${unfilled ? "MISS" : "ok  "}  ${key.padEnd(38)} ${unfilled ? "" : value.length + "자"}`);
}

if (pending.length) {
    console.log("\n아직 비어 있음 (Phase 1 진행은 막지 않음):");
    pending.forEach((item) => console.log(`   - ${item}`));
}

console.log(failed === 0 ? "\n두 접속 모두 정상입니다." : `\n실패 ${failed}건`);
process.exit(failed ? 1 : 0);
