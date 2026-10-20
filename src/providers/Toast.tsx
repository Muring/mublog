"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ToastViewport, ToastItem } from "@/components/ui/Toast.styled";
import CloseIcon from "@/components/ui/CloseIcon";

type ToastKind = "success" | "error" | "info";
type ToastAction = { label: string; href: string };

type Toast = {
    id: string;
    kind: ToastKind;
    message: string;
    action?: ToastAction;
};

type ToastApi = {
    success: (message: string, action?: ToastAction) => void;
    error: (message: string) => void;
    info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
    const api = useContext(ToastContext);
    if (!api) throw new Error("useToast 는 ToastProvider 안에서만 쓸 수 있습니다.");
    return api;
}

// 오류는 읽는 데 시간이 더 걸리므로 오래 남긴다
const DURATION: Record<ToastKind, number> = {
    success: 3500,
    info: 3500,
    error: 5000,
};

export default function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

    const dismiss = useCallback((id: string) => {
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // 바로가기를 읽거나 키보드로 조작하는 동안 알림이 사라지지 않게 한다.
    const pause = (id: string) => {
        clearTimeout(timers.current.get(id));
        timers.current.delete(id);
    };
    const resume = (toast: Toast) => {
        pause(toast.id);
        timers.current.set(toast.id, setTimeout(() => dismiss(toast.id), 8000));
    };

    const push = useCallback(
        (kind: ToastKind, message: string, action?: ToastAction) => {
            const id = crypto.randomUUID();
            // 같은 내용이 연달아 쌓이면 화면만 어지러워지므로 이전 것을 걷어낸다
            setToasts((prev) => [...prev.filter((t) => t.message !== message), { id, kind, message, action }]);
            timers.current.set(
                id,
                setTimeout(() => dismiss(id), action ? 8000 : DURATION[kind])
            );
        },
        [dismiss]
    );

    const api = useMemo<ToastApi>(
        () => ({
            success: (message, action) => push("success", message, action),
            error: (message) => push("error", message),
            info: (message) => push("info", message),
        }),
        [push]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            {/*
              role="status" + aria-live 로 스크린리더에도 알린다.
              오류까지 assertive 로 두면 읽던 내용을 끊으므로 polite 를 쓴다.
            */}
            <ToastViewport role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} className={toast.kind}
                        onMouseEnter={() => { if (toast.action) pause(toast.id); }}
                        onMouseLeave={(event) => {
                            if (toast.action && !event.currentTarget.contains(document.activeElement)) resume(toast);
                        }}
                        onFocus={() => { if (toast.action) pause(toast.id); }}
                        onBlur={(event) => {
                            if (toast.action && !event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(":hover")) resume(toast);
                        }}>
                        <span className="message">{toast.message}</span>
                        {toast.action && (
                            <Link className="action" href={toast.action.href} prefetch={false} onClick={() => dismiss(toast.id)}>
                                {toast.action.label}
                            </Link>
                        )}
                        <button
                            type="button"
                            className="dismiss"
                            aria-label="알림 닫기"
                            onClick={() => dismiss(toast.id)}
                        >
                            <CloseIcon size={14} strokeWidth={2} />
                        </button>
                    </ToastItem>
                ))}
            </ToastViewport>
        </ToastContext.Provider>
    );
}
