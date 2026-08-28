import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * 세션 쿠키 갱신 + /admin 접근 차단.
 *
 * 주의 1: 반드시 여기서 만든 supabaseResponse 를 그대로 돌려줘야 한다.
 *         새 NextResponse 를 만들어 본문만 옮기면 갱신된 쿠키가 조용히 사라져
 *         무작위 로그아웃이 발생한다.
 * 주의 2: setAll 의 두 번째 인자 headers 를 응답에 반드시 반영한다.
 *         인증 쿠키가 실린 응답이 CDN 에 캐시되면 다른 사용자에게 세션이 새어나간다.
 * 주의 3: 이것은 UX 용 가드일 뿐 보안 경계가 아니다. 실제 인가는 서버에서 다시 확인한다.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet, headers) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                    Object.entries(headers).forEach(([key, value]) =>
                        supabaseResponse.headers.set(key, value)
                    );
                },
            },
        }
    );

    // getUser() 호출이 토큰 갱신을 유발한다. 빼면 세션이 만료된 채 남는다.
    // getSession() 은 JWT 서명을 검증하지 않으므로 서버에서는 쓰지 않는다.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
