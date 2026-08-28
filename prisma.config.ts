import { loadEnvFile } from "node:process";
import { defineConfig, env } from "prisma/config";

// Prisma 7 은 .env 를 자동으로 읽지 않는다.
// Vercel 빌드처럼 .env 파일이 없고 플랫폼이 환경변수를 주입하는 경우도 있으므로 실패는 무시한다.
try {
    loadEnvFile(".env");
} catch {
    // .env 없음 - 이미 주입된 process.env 를 그대로 사용
}

// 마이그레이션/인트로스펙션 전용 접속 정보.
// 애플리케이션 런타임은 이 파일을 쓰지 않고 src/lib/prisma.ts 의 드라이버 어댑터를 쓴다.
//
// DATABASE_URL(6543, transaction 풀러)이 아니라 DIRECT_URL(5432, session 풀러)을 쓰는 이유:
// 마이그레이션은 어드바이저리 락과 다중 문장 트랜잭션을 쓰는데
// transaction 모드 풀러에서는 이것이 깨진다.
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DIRECT_URL"),
    },
});
