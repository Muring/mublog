import type { NextRequest } from "next/server";
import type { ZodType } from "zod";
import { HttpError } from "@/lib/auth";

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
