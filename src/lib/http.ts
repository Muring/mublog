import { NextResponse } from "next/server";
import { HttpError } from "@/lib/auth";

/** API 라우트 공통 에러 처리. 예상치 못한 오류의 내부 정보를 노출하지 않는다. */
export function handleApiError(error: unknown, context: string) {
    if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`[${context}]`, error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
}
