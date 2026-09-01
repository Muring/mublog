import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";
import { HttpError } from "@/lib/auth";

/**
 * 라우트 핸들러 공통 헬퍼.
 *
 * 한 요청에서 parseBody 로 받고 handleApiError 로 끝내는 짝이라 한 파일에 둔다.
 * 클라이언트에서 요청을 보내는 쪽은 lib/fetcher.ts 다.
 */

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

/** 예상치 못한 오류의 내부 정보를 응답에 노출하지 않는다. */
export function handleApiError(error: unknown, context: string) {
    if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`[${context}]`, error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
}
