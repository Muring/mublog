import { NextResponse, type NextRequest } from "next/server";
import { revalidateEverything } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/revalidate — 캐시를 전부 지운다.
 *
 * 스크립트(draft:post, migrate:posts, 일회성 정리)가 DB 를 직접 고친 뒤 부른다.
 * 에디터에서 고친 건 저장 라우트가 알아서 지우므로 이걸 부를 일이 없다.
 *
 * 세션이 아니라 CRON_SECRET 으로 잠근다 — 부르는 쪽이 브라우저가 아니라 터미널이다.
 * 잘못 열려도 캐시를 비우는 것뿐이라 데이터는 안전하지만, 반복 호출로 DB 를 두드릴 수 있어 막는다.
 */
export async function POST(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    revalidateEverything();
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
