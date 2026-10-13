"use client";

import { useCallback, useSyncExternalStore } from "react";

/** 움직임 줄이기 설정. 미디어 쿼리 문자열을 자리마다 다시 적지 않는다 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** 지금 움직임 줄이기가 켜져 있는가. 누르는 순간·애니메이션 시작 시점에 한 번 볼 때 쓴다 */
export function prefersReducedMotion() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * 미디어 쿼리가 맞는지를 상태로 든다. 바뀌면 다시 그린다.
 *
 * 서버와 하이드레이션 첫 렌더는 false 다 — 서버는 화면 폭을 모르므로, 렌더 결과가 이 값에 따라 크게 갈리는
 * 레이아웃은 CSS 미디어 쿼리로 처리하고 이 훅은 그 뒤의 동작(선택지 구성·자동 재생 등)에만 쓴다(AGENTS §3).
 */
export function useMediaQuery(query: string) {
    const subscribe = useCallback((onChange: () => void) => {
        const media = window.matchMedia(query);
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [query]);
    return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
