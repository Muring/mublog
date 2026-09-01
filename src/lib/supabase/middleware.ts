import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { JWK } from "@supabase/supabase-js";

/**
 * JWKS 를 프로세스 단위로 캐시한다.
 *
 * getClaims() 는 서명 키를 supabase 클라이언트 인스턴스에 캐시하는데,
 * 이 프록시는 요청마다 새 클라이언트를 만든다. 그대로 두면 로그인한 사용자의
 * 모든 요청이 JWKS 를 새로 받아, 왕복을 없애려고 바꾼 의미가 사라진다.
 *
 * 키를 넘겨주면 그 안에서 kid 를 먼저 찾고, 없으면(키 교체 등) 알아서 다시 받는다.
 * 그래서 캐시가 오래돼도 인증이 깨지지 않는다.
 */
type Jwks = { keys: JWK[] };
let jwksCache: Jwks | null = null;
let jwksFetchedAt = 0;
let jwksInFlight: Promise<Jwks | null> | null = null;
const JWKS_TTL_MS = 10 * 60 * 1000;

async function loadJwks(): Promise<Jwks | null> {
    if (jwksCache && Date.now() - jwksFetchedAt < JWKS_TTL_MS) return jwksCache;
    // 동시에 여러 요청이 들어와도 한 번만 받는다
    if (jwksInFlight) return jwksInFlight;

    jwksInFlight = (async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
            );
            if (!res.ok) return null;
            const data = (await res.json()) as Jwks;
            if (!data?.keys?.length) return null;
            jwksCache = data;
            jwksFetchedAt = Date.now();
            return data;
        } catch {
            // 실패해도 getClaims 가 스스로 받아오므로 인증은 계속 동작한다
            return null;
        } finally {
            jwksInFlight = null;
        }
    })();

    return jwksInFlight;
}

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

    // getClaims() 를 쓰는 이유:
    //
    // 이 프로젝트는 ES256(비대칭) 서명 키라 서명을 로컬에서 검증할 수 있다.
    // getUser() 는 매 요청마다 Auth 서버에 물어보느라 왕복 70ms(콜드 400ms)가 붙는데,
    // getClaims() 는 JWKS 를 한 번 받아 캐시한 뒤 crypto.subtle.verify 로 끝낸다.
    //
    // 토큰 갱신은 그대로다. getClaims() 는 내부에서 getSession() 을 부르고,
    // 만료가 임박했으면 먼저 갱신한 뒤 검증한다. 갱신된 쿠키는 아래 setAll 로 실린다.
    //
    // 여기서 로컬 검증으로 바꿔도 안전한 이유는 이 호출이 인가 결정이 아니기 때문이다.
    // 이 값은 /admin 미인증 방문자를 /login 으로 보내는 UX 용도로만 쓴다.
    // 실제 인가는 admin/layout.tsx 의 requireAdmin() 이 확정하며, 그쪽은 계속
    // getUser() 로 Auth 서버에 물어본다. 그래야 토큰을 원격 폐기했을 때 즉시 막힌다.
    //
    // getSession() 으로 대신하지 않는다. 그것은 쿠키를 읽기만 하고 서명을 검증하지 않는다.
    const jwks = await loadJwks();
    const { data } = await supabase.auth.getClaims(undefined, jwks ? { keys: jwks.keys } : undefined);
    const isSignedIn = Boolean(data?.claims?.sub);

    if (!isSignedIn && request.nextUrl.pathname.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
