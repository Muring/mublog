"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** 캐시가 먼저 갱신돼도 첫 하이드레이션은 서버가 보낸 값으로 맞춘다. 이후에는 최신 값을 쓴다. */
export function useHydratedValue<T>(value: T, serverValue: T): T {
    return useSyncExternalStore(subscribe, () => value, () => serverValue);
}
