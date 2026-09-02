import { useEffect, useState } from "react";
import { useDebouncedEffect } from "@/hooks/useDebouncedEffect";
import { fetchJson } from "@/lib/fetcher";

export type SlugState = { checking: boolean; available: boolean | null; reason: string | null };

const EMPTY: SlugState = { checking: false, available: null, reason: null };

/**
 * slug 의 형식과 중복을 서버에 물어본다.
 *
 * 두 단계로 나뉜다. 입력이 바뀌는 즉시 "확인 중" 으로 바꾸고, 타이핑이 멈춘
 * 뒤에야 서버에 묻는다. 이때 이전 판정을 지우지 않는 것이 중요하다 —
 * 매 타이핑마다 결과를 비우면 "확인 중" 과 결과가 번갈아 나타나 깜빡인다.
 */
export function useSlugCheck(slug: string, excludeId: string | null): SlugState {
    const [state, setState] = useState<SlugState>(EMPTY);

    // 입력이 바뀌면 곧바로 진행 중임을 알린다. 서버 요청은 아래에서 디바운스된다.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => (slug ? { ...prev, checking: true } : EMPTY));
    }, [slug, excludeId]);

    useDebouncedEffect(
        async (isCancelled) => {
            if (!slug) return;

            const params = new URLSearchParams({ slug });
            if (excludeId) params.set("excludeId", excludeId);

            try {
                const data = await fetchJson<{ available: boolean; reason: string | null }>(
                    "/api/admin/slug-check?" + params.toString()
                );
                if (!isCancelled()) {
                    setState({ checking: false, available: data.available, reason: data.reason });
                }
            } catch {
                // 확인에 실패하면 판정을 비운다. 저장 자체는 서버가 다시 막는다.
                if (!isCancelled()) setState(EMPTY);
            }
        },
        [slug, excludeId],
        500
    );

    return state;
}
