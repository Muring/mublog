"use client";

import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import { OVERLAY_EXIT_MS } from "@/styles/motion";

/*
 * 떴다 사라지는 창의 공용 동작. 움직임 자체는 styles/motion.ts 의 overlay* 가 맡는다.
 */

/** 지금 뒤 페이지를 잠그고 있는 창의 수. 창 위에 창이 뜨면(시트 → 확인창) 마지막 하나가 닫힐 때 푼다 */
let locks = 0;
let saved: { html: string; body: string } | null = null;

/**
 * 떠 있는 동안 뒤 페이지가 스크롤되지 않게 한다.
 * body 만 막으면 모바일 Safari 는 터치 스크롤이 문서(html)로 새어 나가므로 둘 다 잠근다.
 * 막 위의 터치 끌기까지 막으려면 막에 touch-action: none 을 함께 준다.
 */
export function useScrollLock(active = true) {
    useEffect(() => {
        if (!active) return;
        if (locks++ === 0) {
            saved = { html: document.documentElement.style.overflow, body: document.body.style.overflow };
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        }
        return () => {
            if (--locks > 0 || !saved) return;
            document.documentElement.style.overflow = saved.html;
            document.body.style.overflow = saved.body;
            saved = null;
        };
    }, [active]);
}

/**
 * 닫힘 애니메이션이 끝난 뒤에 실제로 닫는다.
 *
 *   const { closing, requestClose, onAnimationEnd } = useExitTransition(onClose);
 *   <Overlay data-closing={closing || undefined} onAnimationEnd={onAnimationEnd}> ... 닫기 = requestClose
 *
 * - 움직임 줄이기 설정이면 애니메이션이 없어 animationend 가 오지 않으므로 곧바로 닫는다.
 * - animationend 가 끝내 오지 않을 때(가려진 탭은 프레임이 멈춘다)를 위해 닫힘 시간보다
 *   넉넉히 기다린 뒤 닫는 안전망을 둔다. 그러지 않으면 반쯤 사라진 창이 화면을 막는다.
 * - onAnimationEnd 는 뿌리 요소에 단다. 안쪽 요소의 애니메이션도 올라오므로 자기 것만 본다.
 */
export function useExitTransition(onClosed: () => void) {
    const [closing, setClosing] = useState(false);
    const done = useRef(false);

    const finish = useCallback(() => {
        if (done.current) return;
        done.current = true;
        setClosing(false);
        onClosed();
    }, [onClosed]);

    const requestClose = useCallback(() => {
        done.current = false;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
        else setClosing(true);
    }, [finish]);

    useEffect(() => {
        if (!closing) return;
        const timer = window.setTimeout(finish, OVERLAY_EXIT_MS + 220);
        return () => window.clearTimeout(timer);
    }, [closing, finish]);

    const onAnimationEnd = useCallback(
        (event: AnimationEvent) => {
            if (closing && event.target === event.currentTarget) finish();
        },
        [closing, finish]
    );

    return { closing, requestClose, onAnimationEnd };
}
