"use client";

import { useSearchParams } from "next/navigation";
import { listStateUrl, readListState, replaceListUrl, type ListField, type ListState } from "@/lib/admin-navigation";

/**
 * 주소에 둔 보기 상태를 읽고 바꾼다(lib/admin-navigation 의 규칙).
 * 바꿀 때는 지금 주소에서 다시 읽어 합친다. 한 번에 여러 번 바꿔도 앞의 변경을 덮어쓰지 않는다.
 */
export function useListState<F extends Record<string, ListField>>(pathname: string, fields: F) {
    const params = useSearchParams();
    const state = readListState(new URLSearchParams(params), fields);
    const update = (patch: Partial<ListState<F>>) => {
        const current = readListState(new URLSearchParams(window.location.search), fields);
        replaceListUrl(listStateUrl(pathname, { ...current, ...patch }, fields));
    };
    return [state, update] as const;
}
