"use client";

import { useEffect, useRef, type ChangeEvent, type CompositionEvent } from "react";

/**
 * 한글이 들어가는 검색창. 조합 중에는 바깥 상태를 바꾸지 않고, 조합이 끝났을 때만 onCommit 한다.
 *
 * controlled value 로 매 onChange 마다 URL·상태를 바꾸면 조합이 끊겨 자모가 풀린다(AGENTS §2).
 * 그래서 입력창은 uncontrolled 로 두고, 바깥 값이 바뀌면(초기화·뒤로 가기) 조합 중이 아닐 때만 맞춘다.
 *
 *   const { inputProps } = useImeInput(q, setQ);
 *   <input type="search" {...inputProps} />
 *
 * syncWhileFocused 를 끄면 입력 중인 창은 바깥 값으로 덮지 않는다. 값을 다듬어(trim) 돌려받는 쪽이
 * 치는 도중에 글자가 바뀌지 않게 한다.
 */
export function useImeInput(value: string, onCommit: (value: string) => void, { syncWhileFocused = true } = {}) {
    const ref = useRef<HTMLInputElement>(null);
    const composing = useRef(false);

    useEffect(() => {
        const input = ref.current;
        if (!input || composing.current) return;
        if (!syncWhileFocused && document.activeElement === input) return;
        input.value = value;
    }, [value, syncWhileFocused]);

    return {
        inputRef: ref,
        /** 초기화 버튼처럼 바깥 값이 이미 빈 값이라 다시 맞춰지지 않을 때 입력창을 직접 비운다 */
        clear: () => { if (ref.current) ref.current.value = ""; },
        /** 조합 중인가. 디바운스·Enter 처리처럼 입력창 밖에서도 확인해야 하는 곳이 쓴다 */
        composing,
        inputProps: {
            ref,
            defaultValue: value,
            onCompositionStart: () => { composing.current = true; },
            onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => {
                composing.current = false;
                onCommit(event.currentTarget.value);
            },
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                if (!composing.current) onCommit(event.currentTarget.value);
            },
        },
    };
}
