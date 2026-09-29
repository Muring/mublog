"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Admin.styled";
import { SheetOverlay, SheetPanel } from "./AdminImages.styled";
import { useExitTransition, useScrollLock } from "@/hooks/useOverlay";

/**
 * 좁은 화면에서 이미지 상세를 아래에서 올라오는 시트로 보여준다.
 *
 * 네이티브 dialog(showModal) 를 쓰지 않는다. top layer 에 올라가면 z-index 로 띄우는
 * 확인 대화상자(useConfirm)가 그 밑에 깔려, 시트 안의 삭제 버튼을 눌러도 확인창이 안 보인다.
 * 그래서 이미지 고르기 모달처럼 body 에 붙인 막으로 그리고 Escape·Tab 을 직접 다룬다.
 *
 * 올라오고 내려가는 움직임·움직임 줄이기·닫힘 안전망·뒤 스크롤 잠금은 다른 창들과 같은
 * 공용 동작(hooks/useOverlay, styles/motion 의 overlay*)을 쓴다.
 */
export default function ImageDetailSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    const panel = useRef<HTMLElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const { closing, requestClose, onAnimationEnd } = useExitTransition(onClose);
    useScrollLock();

    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        closeButton.current?.focus();
        // 위에 다른 대화상자(확인창·이미지 뷰어)가 떠 있으면 키 입력은 그쪽 몫이다
        const covered = () => Boolean(document.querySelector("[data-confirm-dialog], dialog[open]"));
        const onKeyDown = (event: KeyboardEvent) => {
            if (covered()) return;
            if (event.key === "Escape") {
                event.preventDefault();
                requestClose();
                return;
            }
            // Tab 을 시트 안에 가둔다. 뒤에 가려진 그리드로 빠져나가면 보이지 않는 곳에 포커스가 놓인다
            if (event.key !== "Tab" || !panel.current) return;
            const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"));
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
            if (opener?.isConnected) opener.focus();
        };
    }, [requestClose]);

    return createPortal(
        <SheetOverlay
            data-closing={closing || undefined}
            onAnimationEnd={onAnimationEnd}
            // 막을 누르면 닫는다. 시트 안쪽 클릭이 올라와 닫히지 않도록 대상을 확인한다
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) requestClose();
            }}
        >
            <SheetPanel
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="image-sheet-title"
            >
                <div className="sheet-head">
                    <h2 id="image-sheet-title">이미지 정보</h2>
                    <Button type="button" ref={closeButton} onClick={requestClose}>닫기</Button>
                </div>
                {children}
            </SheetPanel>
        </SheetOverlay>,
        document.body
    );
}
