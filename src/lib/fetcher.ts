/**
 * 클라이언트에서 JSON 을 받아오는 공통 함수.
 *
 * 컴포넌트마다 res.ok 검사와 오류 메시지 추출을 되풀이하고 있었다.
 * 서버가 { error } 를 실어 보내면 그 문구를 그대로 살려 사용자에게 보여준다.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "요청을 처리하지 못했습니다.");
    }

    return res.json() as Promise<T>;
}

/** JSON 본문을 보내는 요청. Content-Type 지정을 매번 적지 않기 위한 것. */
export function jsonRequest(method: "POST" | "PATCH", body: unknown): RequestInit {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    };
}
