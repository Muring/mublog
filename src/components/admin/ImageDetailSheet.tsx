"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Admin.styled";
import { DetailPanel, SheetOverlay } from "./AdminImages.styled";

/**
 * 좁은 화면에서 이미지 상세를 아래에서 올라오는 시트로 보여준다.
 *
 * 네이티브 dialog(showModal) 를 쓰지 않는다. top layer 에 올라가면 z-index 로 띄우는
 * 확인 대화상자(useConfirm)가 그 밑에 깔려, 시트 안의 삭제 버튼을 눌러도 확인창이 안 보인다.
 * 그래서 이미지 고르기 모달처럼 body 에 붙인 막으로 그리고 Escape·Tab 을 직접 다룬다.
 *
 * 열 때는 아래에서 올라오고, 닫을 때는 내려간 뒤에 없어진다(SideMenu 와 같은 방식 —
 * closing 으로 내려가는 애니메이션을 돌리고 animationend 에서 실제로 닫는다).
 * 움직임 줄이기 설정이면 애니메이션이 없어 animationend 가 오지 않으므로 바로 닫는다.
 * 닫힘 시간(200ms)은 AdminImages.styled 의 image-sheet-down 과 짝이다.
 */
export default function ImageDetailSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    const panel = useRef<HTMLElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const [closing, setClosing] = useState(false);

    const requestClose = useCallback(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) onClose();
        else setClosing(true);
    }, [onClose]);

    /*
     * animationend 가 끝내 오지 않을 때의 안전망. 탭이 가려져 프레임이 멈추면 애니메이션도 이벤트도 멈춰
     * 시트가 반쯤 내려간 채 화면을 막는다. 닫힘 애니메이션(200ms)보다 넉넉히 기다린 뒤 닫는다.
     */
    useEffect(() => {
        if (!closing) return;
        const timer = window.setTimeout(onClose, 400);
        return () => window.clearTimeout(timer);
    }, [closing, onClose]);

    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        closeButton.current?.focus();
        /*
         * 뒤 페이지를 굴리지 못하게 막는다. body 만 막으면 모바일 Safari 는 터치 스크롤이 문서(html)로
         * 새어 나가므로 SideMenu 처럼 둘 다 잠근다. 막 위의 터치 끌기는 CSS(touch-action)가 막는다.
         */
        const previous = { body: document.body.style.overflow, html: document.documentElement.style.overflow };
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

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
            document.body.style.overflow = previous.body;
            document.documentElement.style.overflow = previous.html;
            // 이미지를 지워 시트가 닫혔으면 연 카드가 없을 수 있다
            if (opener?.isConnected) opener.focus();
        };
    }, [requestClose]);

    return createPortal(
        <SheetOverlay
            data-closing={closing || undefined}
            // 막을 누르면 닫는다. 시트 안쪽 클릭이 올라와 닫히지 않도록 대상을 확인한다
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) requestClose();
            }}
        >
            <DetailPanel
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="image-sheet-title"
                // 안쪽 요소의 애니메이션도 올라오므로 시트 자신의 것만 본다
                onAnimationEnd={(event) => {
                    if (closing && event.target === event.currentTarget) onClose();
                }}
            >
                <div className="sheet-head">
                    <h2 id="image-sheet-title">이미지 정보</h2>
                    <Button type="button" ref={closeButton} onClick={requestClose}>닫기</Button>
                </div>
                {children}
            </DetailPanel>
        </SheetOverlay>,
        document.body
    );
}
