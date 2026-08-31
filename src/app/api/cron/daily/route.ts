import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sweepOrphanImages } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 하루 한 번 도는 유지보수 작업.
 *
 * Hobby 플랜은 cron 을 하루 1회, 2개까지만 허용하므로 할 일을 한 라우트에 모은다.
 *
 *   1) Supabase 깨우기 — 무료 프로젝트는 7일 무활동 시 정지되고,
 *      정지되면 빌드타임 generateStaticParams 가 실패해 배포까지 막힌다
 *   2) 고아 이미지 정리 — 본문에서 지웠거나, 저장 없이 창을 닫았거나,
 *      포스트를 삭제해 참조를 잃은 파일을 걷어낸다
 *
 * Vercel 은 CRON_SECRET 환경변수가 있으면 그 값을 Authorization 헤더로 보낸다.
 * 이 라우트는 공개 URL 이라 검사를 빼면 누구나 호출할 수 있다.
 */
export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const result: Record<string, unknown> = {};

    try {
        await prisma.$queryRaw`SELECT 1`;
        result.keepalive = "ok";
    } catch (error) {
        console.error("[cron/daily] keepalive", error);
        result.keepalive = "failed";
    }

    try {
        // 24시간 유예를 둔다. 방금 올렸지만 아직 저장하지 않은 초안의 이미지를
        // 지우면 작성 중인 글이 깨진다.
        const sweep = await sweepOrphanImages({ dryRun: false, graceHours: 24 });
        result.sweep = {
            scanned: sweep.total,
            deleted: sweep.deleted.length,
            freedBytes: sweep.freedBytes,
        };
    } catch (error) {
        console.error("[cron/daily] sweep", error);
        result.sweep = "failed";
    }

    return NextResponse.json(result);
}
