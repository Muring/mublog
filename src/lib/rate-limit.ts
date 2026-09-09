/**
 * 인증 없는 엔드포인트 앞에 두는 문지기.
 *
 * 인스턴스 메모리에만 있다. 서버리스에서는 인스턴스마다 따로 세므로 이것은
 * **담이 아니라 과속방지턱이다.** 여러 인스턴스로 흩뿌리는 요청은 막지 못한다.
 * 그래도 두는 이유는 실제로 밟히는 모양이 "한 클라이언트가 같은 함수를
 * 반복해서 두드리는" 것이고, 그건 대개 같은 인스턴스로 가기 때문이다.
 *
 * 제대로 막으려면 공유 저장소가 필요한데 그건 요청마다 쓰기를 만든다 —
 * 이 저장소가 방문 통계에서 피하려고 한 바로 그것이다. 그래서 여기서 멈춘다.
 */

type Bucket = { count: number; expiresAt: number };

/**
 * 담아둘 항목 수의 상한.
 *
 * 자르지 않으면 IP 마다 항목이 쌓여 오래 사는 인스턴스에서 메모리가 샌다.
 * 넘치면 만료된 것을 먼저 치우고, 그래도 넘치면 오래된 것부터 버린다.
 */
const MAX_KEYS = 5_000;

const buckets = new Map<string, Bucket>();

function evict(now: number): void {
    if (buckets.size < MAX_KEYS) return;

    for (const [key, bucket] of buckets) {
        if (bucket.expiresAt <= now) buckets.delete(key);
    }

    // Map 은 삽입 순서를 지키므로 앞쪽이 가장 오래된 것이다.
    while (buckets.size >= MAX_KEYS) {
        const oldest = buckets.keys().next().value;
        if (oldest === undefined) break;
        buckets.delete(oldest);
    }
}

/**
 * `key` 를 한 번 세고, `windowMs` 안에서 `limit` 을 넘었으면 true.
 *
 * 창은 첫 요청에 열리고 **연장되지 않는다.** 계속 두드려도 창이 뒤로 밀리지
 * 않으므로, 차단된 쪽이 조용해질 때까지 기다릴 필요 없이 창이 끝나면 풀린다.
 *
 * 세는 부수효과가 있으므로 조건문에서 단락 평가에 유의해 부른다 —
 * 부르지 않으면 세지 않는다.
 */
export function overLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.expiresAt <= now) {
        evict(now);
        buckets.set(key, { count: 1, expiresAt: now + windowMs });
        return false;
    }

    bucket.count += 1;
    return bucket.count > limit;
}

/**
 * 프록시가 붙여준 클라이언트 IP.
 *
 * Vercel 은 클라이언트가 보낸 x-forwarded-for 를 자기 값으로 덮어쓴다.
 * 다른 곳에 올린다면 그 프록시가 같은 일을 하는지 확인해야 한다 —
 * 그러지 않으면 헤더 하나로 이 문지기를 전부 우회할 수 있다.
 *
 * 헤더가 없으면 모두 한 바구니에 담는다. 못 가르느니 함께 묶는 쪽이 안전하다.
 */
export function clientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const first = forwarded?.split(",")[0]?.trim();
    return first || request.headers.get("x-real-ip") || "unknown";
}
