"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ToastViewport, ToastItem } from "@/components/ui/Toast.styled";

type ToastKind = "success" | "error" | "info";

type Toast = {
    id: string;
    kind: ToastKind;
    message: string;
};

type ToastApi = {
    success: (message: string) => void;
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

    const push = useCallback(
        (kind: ToastKind, message: string) => {
            const id = crypto.randomUUID();
            // 같은 내용이 연달아 쌓이면 화면만 어지러워지므로 이전 것을 걷어낸다
            setToasts((prev) => [...prev.filter((t) => t.message !== message), { id, kind, message }]);
            timers.current.set(
                id,
                setTimeout(() => dismiss(id), DURATION[kind])
            );
        },
        [dismiss]
    );

    const api = useMemo<ToastApi>(
        () => ({
            success: (message) => push("success", message),
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
                    <ToastItem key={toast.id} className={toast.kind}>
                        <span className="message">{toast.message}</span>
                        <button
                            type="button"
                            className="dismiss"
                            aria-label="알림 닫기"
                            onClick={() => dismiss(toast.id)}
                        >
                            ✕
                        </button>
                    </ToastItem>
                ))}
            </ToastViewport>
        </ToastContext.Provider>
    );
}
