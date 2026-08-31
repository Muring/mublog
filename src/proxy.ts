import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    matcher: [
        // 정적 자산과 방문 집계 비콘은 제외한다.
        // 특히 /api/visit 은 렌더 경로 밖에서 도는 비콘이라 세션 갱신이 불필요하다.
        "/((?!_next/static|_next/image|favicon.ico|icons/|images/|thumbnails/|fonts/|api/visit|.*\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff2?)$).*)",
    ],
};
