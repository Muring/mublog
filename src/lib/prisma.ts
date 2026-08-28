import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

// Prisma 7 은 런타임 접속을 드라이버 어댑터로 처리한다.
// 접속 문자열은 스키마가 아니라 여기서 주입된다.
//
// DATABASE_URL 은 Supabase Supavisor 의 transaction 모드(6543)를 가리켜야 한다.
// 서버리스 함수마다 풀이 따로 생기므로 connection_limit=1 로 묶어두지 않으면
// 무료 티어의 커넥션 한도가 금방 고갈된다.
function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL 이 설정되지 않았습니다.");
    }

    return new PrismaClient({
        adapter: new PrismaPg({
            connectionString,
            // DB 가 불통이면 빌드가 무한정 매달리는 대신 명확히 실패하게 한다.
            // (Supabase 무료 프로젝트는 7일 무활동 시 정지된다)
            connectionTimeoutMillis: 10_000,
        }),
        log: ["error", "warn"],
    });
}

// 개발 중 HMR 이 반복되면 커넥션이 계속 쌓이므로 전역에 하나만 둔다.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
