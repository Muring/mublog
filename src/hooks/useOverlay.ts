"use client";

import { useCallback, useEffect, useRef, useState, type AnimationEvent, type RefObject } from "react";
import { OVERLAY_EXIT_MS } from "@/styles/motion";
import { prefersReducedMotion } from "./useMediaQuery";

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
        if (prefersReducedMotion()) finish();
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

/** Tab 으로 돌 수 있는 것. 꺼진 버튼은 포커스를 받지 못하므로 처음·끝 계산에서 뺀다 */
const FOCUSABLE = "a[href], button:not(:disabled), input:not(:disabled)";

/**
 * Tab 을 root 안에 가둔다. 그러지 않으면 뒤에 가려진 페이지로 빠져나가 보이지 않는 곳에 포커스가 놓인다.
 * 목록은 누를 때마다 다시 센다 — 이미지 목록처럼 뜬 뒤에 늦게 채워지는 창이 있다.
 */
export function trapTab(event: { key: string; shiftKey: boolean; preventDefault: () => void }, root: ParentNode | null | undefined) {
    if (event.key !== "Tab" || !root) return;
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

/**
 * body 에 붙인 창(시트·이미지 고르기·확인창)의 키보드 동작. 네이티브 dialog 가 아니라서 직접 다룬다.
 *
 * - 뜰 때 initialFocus 로 포커스를 옮기고, Escape 로 닫고, Tab 을 root 안에 가둔다.
 * - 이미 처리된 키(defaultPrevented — 펼쳐진 드롭다운의 Escape 등)는 건드리지 않는다.
 * - ignore 가 참이면 키를 넘긴다. 위에 다른 창이 떠 있으면 키 입력은 그쪽 몫이다.
 * - restoreFocus 면 닫힐 때 연 요소로 초점을 돌려준다. 스크롤을 잠근 채 옮기면 페이지가 튀므로 preventScroll 로 옮긴다.
 *
 * 뜰 때 한 번만 건다. onEscape 가 렌더마다 바뀌어도 포커스를 다시 잡지 않도록 최신 값은 ref 로 읽는다.
 */
export function useDialogKeys(
    root: RefObject<HTMLElement | null>,
    onEscape: () => void,
    { initialFocus, restoreFocus = false, ignore }: { initialFocus?: RefObject<HTMLElement | null>; restoreFocus?: boolean; ignore?: () => boolean } = {}
) {
    const latest = useRef({ onEscape, ignore });
    useEffect(() => {
        latest.current = { onEscape, ignore };
    });

    useEffect(() => {
        const opener = restoreFocus && document.activeElement instanceof HTMLElement ? document.activeElement : null;
        initialFocus?.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || latest.current.ignore?.()) return;
            if (event.key === "Escape") {
                event.preventDefault();
                latest.current.onEscape();
                return;
            }
            trapTab(event, root.current);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            // 이미지를 지워 시트가 닫혔으면 연 요소가 없을 수 있다
            if (opener?.isConnected) opener.focus({ preventScroll: true });
        };
        // 뜰 때 한 번만 건다(위 설명)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
