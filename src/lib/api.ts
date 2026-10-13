import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";
import { HttpError } from "@/lib/auth";

/**
 * 라우트 핸들러 공통 헬퍼.
 *
 * 한 요청에서 parseBody 로 받고 handleApiError 로 끝내는 짝이라 한 파일에 둔다.
 * 클라이언트에서 요청을 보내는 쪽은 lib/fetcher.ts 다.
 */

/** 사용자별 응답. 브라우저도 CDN 도 담아두지 않는다 */
export const PRIVATE_NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * 세션이 아니라 CRON_SECRET 으로 잠그는 라우트(Vercel cron·터미널 스크립트)의 문지기.
 * Vercel 은 CRON_SECRET 이 있으면 그 값을 Authorization 헤더로 보낸다.
 * 비밀값이 없거나 맞지 않으면 돌려줄 401 응답을, 통과하면 null 을 준다.
 */
export function rejectWithoutCronSecret(request: Request): NextResponse | null {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get("authorization") === `Bearer ${secret}`) return null;
    return new NextResponse("Unauthorized", { status: 401 });
}

/**
 * 요청 본문을 스키마로 검증한다.
 *
 * 라우트마다 safeParse -> issues[0].message -> 400 응답을 되풀이하고 있었다.
 * 실패를 HttpError 로 올려보내면 handleApiError 가 한 곳에서 처리한다.
 */
export async function parseBody<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        throw new HttpError(400, "요청 본문을 읽을 수 없습니다.");
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        throw new HttpError(400, parsed.error.issues[0]?.message ?? "잘못된 입력입니다.");
    }
    return parsed.data;
}

/**
 * 예상치 못한 오류의 내부 정보를 응답에 노출하지 않는다.
 *
 * fallback 은 HttpError 가 아닌 오류에 쓸 문구다. 라우트마다 "포스트를 불러오지
 * 못했습니다" 처럼 더 구체적으로 말할 수 있으면 그 편이 낫기 때문에 열어 둔다.
 * 어느 쪽이든 내부 오류 내용은 로그에만 남는다.
 */
export function handleApiError(
    error: unknown,
    context: string,
    fallback = "서버 오류가 발생했습니다."
) {
    if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`[${context}]`, error);
    return NextResponse.json({ error: fallback }, { status: 500 });
}
