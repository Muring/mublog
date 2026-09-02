import type { JWK } from "@supabase/supabase-js";

/**
 * JWKS 를 프로세스 단위로 캐시한다.
 *
 * getClaims() 는 서명 키를 supabase 클라이언트 인스턴스에 캐시하는데,
 * 서버 쪽은 요청마다 새 클라이언트를 만든다. 그대로 두면 로그인한 사용자의
 * 모든 요청이 JWKS 를 새로 받아, Auth 왕복을 없애려고 바꾼 의미가 사라진다.
 *
 * 키를 넘겨주면 그 안에서 kid 를 먼저 찾고, 없으면(키 교체 등) 알아서 다시 받는다.
 * 그래서 캐시가 오래돼도 인증이 깨지지 않는다.
 */
type Jwks = { keys: JWK[] };

let cache: Jwks | null = null;
let fetchedAt = 0;
let inFlight: Promise<Jwks | null> | null = null;
const TTL_MS = 10 * 60 * 1000;

async function loadJwks(): Promise<Jwks | null> {
    if (cache && Date.now() - fetchedAt < TTL_MS) return cache;
    // 동시에 여러 요청이 들어와도 한 번만 받는다
    if (inFlight) return inFlight;

    inFlight = (async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
            );
            if (!res.ok) return null;
            const data = (await res.json()) as Jwks;
            if (!data?.keys?.length) return null;
            cache = data;
            fetchedAt = Date.now();
            return data;
        } catch {
            // 실패해도 getClaims 가 스스로 받아오므로 인증은 계속 동작한다
            return null;
        } finally {
            inFlight = null;
        }
    })();

    return inFlight;
}

/** getClaims() 의 두 번째 인자. 키를 못 받았으면 undefined 를 넘겨 스스로 받게 둔다. */
export async function jwksOption() {
    const jwks = await loadJwks();
    return jwks ? { keys: jwks.keys } : undefined;
}
