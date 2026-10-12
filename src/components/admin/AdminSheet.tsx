"use client";

import { useEffect, useId, useRef, type ComponentType, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SheetOverlay, SheetPanel } from "./AdminSheet.styled";
import { useExitTransition, useScrollLock } from "@/hooks/useOverlay";

/**
 * 좁은 화면에서 아래에서 올라오는 시트. 이미지 상세와 관리 목록의 필터가 함께 쓴다.
 *
 * 네이티브 dialog(showModal) 를 쓰지 않는다. top layer 에 올라가면 z-index 로 띄우는
 * 확인 대화상자(useConfirm)가 그 밑에 깔려, 시트 안의 삭제 버튼을 눌러도 확인창이 안 보인다.
 * 그래서 이미지 고르기 모달처럼 body 에 붙인 막으로 그리고 Escape·Tab 을 직접 다룬다.
 *
 * 올라오고 내려가는 움직임·움직임 줄이기·닫힘 안전망·뒤 스크롤 잠금은 다른 창들과 같은
 * 공용 동작(hooks/useOverlay, styles/motion 의 overlay*)을 쓴다.
 *
 * 닫기 버튼 대신 위쪽 손잡이 막대를 둔다. 막대·제목 줄을 끌어내리면 닫히고, 막대를 눌러도 닫힌다.
 * 키보드는 막대 버튼과 Escape 로 닫는다.
 */
type Props = {
    id?: string;
    title: string;
    onClose: () => void;
    children: ReactNode | ((close: () => void) => ReactNode);
    /** 바닥에 붙는 마무리 버튼들. close 를 부르면 닫힘 애니메이션을 거쳐 닫힌다 */
    footer?: (close: () => void) => ReactNode;
    /** 내용 모양을 더한 본체(예: 이미지 상세). 기본은 SheetPanel */
    Panel?: ComponentType<React.ComponentProps<typeof SheetPanel>>;
};

/** 이만큼 끌어내리거나 빠르게 튕기면 닫는다. 그보다 덜 끌면 제자리로 돌아간다 */
const DISMISS_DISTANCE = 96;
const DISMISS_VELOCITY = 0.5; // px/ms

export default function AdminSheet({ id, title, onClose, children, footer, Panel = SheetPanel }: Props) {
    const titleId = useId();
    const panel = useRef<HTMLElement>(null);
    const overlay = useRef<HTMLDivElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const { closing, requestClose, onAnimationEnd } = useExitTransition(onClose);
    useScrollLock();
    const drag = useRef<{ startY: number; startTime: number; dy: number; moved: boolean; onGrabber: boolean } | null>(null);

    const onDragStart = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || closing) return;
        // 빠르게 끌면 첫 이동부터 이 줄 밖이라, 누르는 순간 포인터를 붙잡아 둔다
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startY: event.clientY, startTime: event.timeStamp, dy: 0, moved: false, onGrabber: Boolean((event.target as Element).closest(".sheet-grabber")) };
        if (panel.current) panel.current.style.transition = "none";
    };
    const onDragMove = (event: PointerEvent<HTMLDivElement>) => {
        const state = drag.current;
        if (!state || !panel.current) return;
        // 위로는 따라가지 않는다. 시트가 바닥에서 떨어져 보이면 안 된다
        state.dy = Math.max(0, event.clientY - state.startY);
        if (state.dy > 4) state.moved = true;
        panel.current.style.transform = `translateY(${state.dy}px)`;
    };
    const onDragEnd = () => {
        const state = drag.current;
        drag.current = null;
        if (!state || !panel.current) return;
        // 포인터를 붙잡으면 click 이 막대 버튼에 가지 않는다. 끌지 않고 막대를 누른 것은 여기서 닫는다
        if (!state.moved) {
            panel.current.style.transition = "";
            if (state.onGrabber) requestClose();
            return;
        }
        const velocity = state.dy / Math.max(1, performance.now() - state.startTime);
        if (state.dy > DISMISS_DISTANCE || (state.moved && velocity > DISMISS_VELOCITY)) {
            // 끌어 둔 위치에서 그대로 내려간다(닫힘 애니메이션은 to 만 있어 현재 위치에서 시작한다)
            requestClose();
            return;
        }
        panel.current.style.transition = "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)";
        panel.current.style.transform = "";
    };

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;
        // 키보드는 layout viewport를 그대로 두고 visual viewport만 줄일 수 있다.
        const fit = () => {
            overlay.current?.style.setProperty("--sheet-viewport-top", `${viewport.offsetTop}px`);
            overlay.current?.style.setProperty("--sheet-viewport-height", `${viewport.height}px`);
            const focused = document.activeElement;
            if (!(focused instanceof HTMLInputElement) || !panel.current?.contains(focused) || focused.closest("[popover]")) return;
            const scroller = focused.closest<HTMLElement>(".filter-fields");
            if (!scroller) return;
            const field = focused.getBoundingClientRect();
            const bounds = scroller.getBoundingClientRect();
            if (field.bottom > bounds.bottom) scroller.scrollTop += field.bottom - bounds.bottom + 8;
            else if (field.top < bounds.top) scroller.scrollTop -= bounds.top - field.top + 8;
        };
        fit();
        viewport.addEventListener("resize", fit);
        viewport.addEventListener("scroll", fit);
        return () => {
            viewport.removeEventListener("resize", fit);
            viewport.removeEventListener("scroll", fit);
        };
    }, []);

    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        closeButton.current?.focus();
        // 위에 다른 대화상자(확인창·이미지 뷰어)가 떠 있으면 키 입력은 그쪽 몫이다
        const covered = () => Boolean(document.querySelector("[data-confirm-dialog], dialog[open]"));
        const onKeyDown = (event: KeyboardEvent) => {
            if (covered() || event.defaultPrevented) return;
            if (event.key === "Escape") {
                event.preventDefault();
                requestClose();
                return;
            }
            // Tab 을 시트 안에 가둔다. 뒤에 가려진 그리드로 빠져나가면 보이지 않는 곳에 포커스가 놓인다
            if (event.key !== "Tab" || !panel.current) return;
            const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), input:not(:disabled)"));
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
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            // 이미지를 지워 시트가 닫혔으면 연 카드가 없을 수 있다
            // 초점만 돌려준다. 스크롤을 잠근 채 위에 붙은 버튼으로 옮기면 페이지가 맨 위로 튀었다(FilterBar)
            if (opener?.isConnected) opener.focus({ preventScroll: true });
        };
    }, [requestClose]);

    return createPortal(
        <SheetOverlay
            ref={overlay}
            data-closing={closing || undefined}
            onAnimationEnd={onAnimationEnd}
            // 막을 누르면 닫는다. 시트 안쪽 클릭이 올라와 닫히지 않도록 대상을 확인한다
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) requestClose();
            }}
        >
            <Panel
                ref={panel}
                id={id}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="sheet-drag" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd}>
                    {/* 클릭은 키보드(detail 0)만 받는다. 포인터로 누른 것은 끌기 처리가 닫는다 */}
                    <button type="button" ref={closeButton} className="sheet-grabber" aria-label={`${title} 닫기`}
                        onClick={(event) => { if (event.detail === 0) requestClose(); }}>
                        <span aria-hidden="true" />
                    </button>
                    <div className="sheet-head"><h2 id={titleId}>{title}</h2></div>
                </div>
                <div className="sheet-body">{typeof children === "function" ? children(requestClose) : children}</div>
                {footer && <div className="sheet-foot">{footer(requestClose)}</div>}
            </Panel>
        </SheetOverlay>,
        document.body
    );
}
