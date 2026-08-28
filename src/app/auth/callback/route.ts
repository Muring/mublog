import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GitHub OAuth 콜백. 인가 코드를 세션으로 교환한다. */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    // open redirect 방지: 같은 사이트 내부 경로만 허용한다.
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=missing_code`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("[auth/callback]", error.message);
        return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    // Vercel 프리뷰 배포에서는 origin 이 내부 주소로 잡힐 수 있어
    // 프록시가 넘겨준 원래 호스트를 우선한다. 이걸 빼면 localhost 로 튕긴다.
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    const base =
        process.env.NODE_ENV === "development" || !forwardedHost
            ? origin
            : `${forwardedProto}://${forwardedHost}`;

    return NextResponse.redirect(`${base}${safeNext}`);
}
