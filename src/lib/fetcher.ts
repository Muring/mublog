/**
 * 클라이언트에서 JSON 을 받아오는 공통 함수.
 *
 * 컴포넌트마다 res.ok 검사와 오류 메시지 추출을 되풀이하고 있었다.
 * 서버가 { error } 를 실어 보내면 그 문구를 그대로 살려 사용자에게 보여준다.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    let res: Response;

    try {
        res = await fetch(url, init);
    } catch {
        // fetch 는 연결 자체가 안 되면 TypeError("Failed to fetch") 를 던진다.
        // 호출하는 쪽은 대부분 error.message 를 그대로 사용자에게 보여주므로,
        // 여기서 감싸지 않으면 화면에 영어 메시지가 튀어나온다.
        throw new Error("네트워크에 연결할 수 없습니다.");
    }

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
