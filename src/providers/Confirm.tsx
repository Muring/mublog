"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { ConfirmOverlay, ConfirmBox } from "@/components/ui/ConfirmDialog.styled";
import { useDialogKeys, useExitTransition, useScrollLock } from "@/hooks/useOverlay";

type ConfirmOptions = {
    title: string;
    /** 되돌릴 수 없다는 사실처럼, 누르기 전에 알아야 하는 것 */
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** 되돌릴 수 없는 동작이면 true. 확인 버튼이 위험색을 쓴다 */
    danger?: boolean;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void; id: number };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

/**
 * 확인 대화상자를 띄우고 결과를 기다린다.
 *
 *   if (await confirm({ title: "삭제할까요?" })) { ... }
 *
 * 브라우저의 confirm() 과 호출 모양이 거의 같지만 await 가 붙는다.
 * 그쪽을 쓰지 않는 이유는 셋이다 — 테마와 폰트가 우리 것이 아니고,
 * 문구를 꾸밀 수 없고, 떠 있는 동안 페이지의 자바스크립트가 통째로 멈춘다.
 */
export function useConfirm() {
    const confirm = useContext(ConfirmContext);
    if (!confirm) throw new Error("useConfirm 은 ConfirmProvider 안에서만 쓸 수 있습니다.");
    return confirm;
}

export default function ConfirmProvider({ children }: { children: ReactNode }) {
    const [pending, setPending] = useState<Pending | null>(null);
    // 대화상자를 연 버튼. 닫을 때 포커스를 돌려줘야 키보드 사용자가 자리를 잃지 않는다.
    const openerRef = useRef<HTMLElement | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        openerRef.current = document.activeElement as HTMLElement | null;
        return new Promise<boolean>((resolve) => setPending({ ...options, resolve, id: Date.now() + Math.random() }));
    }, []);

    // 닫힘 애니메이션이 끝나면 치운다. 그 사이 새 확인창이 떴으면 그건 건드리지 않는다
    const remove = useCallback((id: number) => {
        setPending((current) => (current?.id === id ? null : current));
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {pending && <ConfirmLayer key={pending.id} pending={pending} opener={openerRef} onRemoved={remove} />}
        </ConfirmContext.Provider>
    );
}

/**
 * 한 번의 확인창. 답은 누르는 순간 돌려주고(부른 쪽은 곧바로 다음 일을 한다), 창은 가라앉는
 * 애니메이션이 끝난 뒤에 치운다. 새 확인창은 key 가 달라 이 창의 닫힘과 섞이지 않는다.
 * 움직임·뒤 스크롤 잠금은 다른 창들과 같은 공용 동작(hooks/useOverlay)이다.
 */
function ConfirmLayer({ pending, opener, onRemoved }: { pending: Pending; opener: RefObject<HTMLElement | null>; onRemoved: (id: number) => void }) {
    const boxRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const answered = useRef(false);
    const removed = useCallback(() => onRemoved(pending.id), [onRemoved, pending.id]);
    const { closing, requestClose, onAnimationEnd } = useExitTransition(removed);
    useScrollLock();

    const close = useCallback(
        (ok: boolean) => {
            if (answered.current) return;
            answered.current = true;
            pending.resolve(ok);
            opener.current?.focus();
            requestClose();
        },
        [pending, opener, requestClose]
    );

    // 되돌릴 수 없는 동작이 기본값이 되면 안 되므로 취소에 포커스를 준다.
    // Enter 를 무심코 눌렀을 때 일어나는 일이 "아무 일도 없음" 이어야 한다.
    // 초점은 답하는 순간 close 가 돌려준다(창은 그 뒤에 가라앉는다).
    useDialogKeys(boxRef, () => close(false), { initialFocus: cancelRef });

    return (
        <ConfirmOverlay
            data-closing={closing || undefined}
            onAnimationEnd={onAnimationEnd}
            // 막을 누르면 취소한다. 상자 안쪽 클릭이 올라와 닫히지 않도록 대상을 확인한다.
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close(false);
            }}
        >
            <ConfirmBox
                ref={boxRef}
                data-confirm-dialog
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby={pending.description ? "confirm-desc" : undefined}
            >
                <h3 id="confirm-title">{pending.title}</h3>
                {pending.description && <p id="confirm-desc">{pending.description}</p>}

                <div className="actions">
                    <button type="button" ref={cancelRef} onClick={() => close(false)}>
                        {pending.cancelLabel ?? "취소"}
                    </button>
                    <button
                        type="button"
                        className={pending.danger ? "danger" : undefined}
                        onClick={() => close(true)}
                    >
                        {pending.confirmLabel ?? "확인"}
                    </button>
                </div>
            </ConfirmBox>
        </ConfirmOverlay>
    );
}
