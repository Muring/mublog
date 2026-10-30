import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sweepOrphanImages } from "@/lib/storage";
import { rejectWithoutCronSecret } from "@/lib/api";
import { analyticsBackupFailure, backupAnalytics } from "@/lib/analytics-backup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 하루 한 번 도는 유지보수 작업.
 *
 * Hobby 플랜의 하루 1회 유지보수 작업을 한 라우트에 모은다.
 *
 *   1) Supabase 깨우기 — 무료 프로젝트는 7일 무활동 시 정지되고,
 *      정지되면 빌드타임 generateStaticParams 가 실패해 배포까지 막힌다
 *   2) 고아 이미지 정리 — 본문에서 지웠거나, 저장 없이 창을 닫았거나,
 *      포스트를 삭제해 참조를 잃은 파일을 걷어낸다
 *   3) 공개 페이지 분석을 비공개 Storage에 날짜별로 백업한다
 *
 * 이 라우트는 공개 URL 이라 CRON_SECRET 검사를 빼면 누구나 호출할 수 있다.
 */
export async function GET(request: NextRequest) {
    const rejected = rejectWithoutCronSecret(request);
    if (rejected) return rejected;

    const result: Record<string, unknown> = {};
    // 이미지 정리와 함께 실행하되 실패는 각각 보고한다. 백업 자체는 40초 안에 끝낸다.
    const analytics = backupAnalytics().catch(analyticsBackupFailure);

    try {
        await prisma.$queryRaw`SELECT 1`;
        result.keepalive = "ok";
    } catch (error) {
        console.error("[cron/daily] keepalive", error);
        result.keepalive = "failed";
    }

    try {
        // GRACE_HOURS(24시간) 유예를 둔다. 방금 올렸지만 아직 저장하지 않은 초안의 이미지를
        // 지우면 작성 중인 글이 깨진다.
        const sweep = await sweepOrphanImages({ dryRun: false });
        result.sweep = {
            scanned: sweep.total,
            deleted: sweep.deleted.length,
            freedBytes: sweep.freedBytes,
        };
    } catch (error) {
        console.error("[cron/daily] sweep", error);
        result.sweep = "failed";
    }

    const backup = await analytics;
    result.analytics = backup;
    return NextResponse.json(result, { status: backup.ok ? 200 : 503 });
}
