"use client";

import styled from "@emotion/styled";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { strokeIcon } from "@/components/ui/icon";
import { mobile } from "@/styles/breakpoints";
import { Button } from "./Admin.styled";

/** 아이콘만 있는 정사각형 버튼. 받아 오는 동안 아이콘이 돈다(줄인 움직임 설정이면 멈춘 채 둔다) */
const Square = styled(Button)`
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  flex-shrink: 0;
  ${mobile} { width: 44px; height: 44px; }
  &[aria-busy="true"] svg { animation: refreshSpin 1s linear infinite; }
  @keyframes refreshSpin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { &[aria-busy="true"] svg { animation: none; } }
`;

export default function RefreshButton({ busy, onClick, className }: { busy: boolean; onClick: () => void; className?: string }) {
    return (
        <Square type="button" className={className} onClick={onClick} disabled={busy} aria-busy={busy} aria-label={busy ? "새로고침 중" : "새로고침"} title="새로고침">
            <svg {...strokeIcon(16, 1.7)}><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M6.1 6.1A8 8 0 0 1 19.7 10M4.3 14A8 8 0 0 0 17.9 17.9" /></svg>
        </Square>
    );
}

/*
 * 블로그 관리 공통 머리줄의 새로고침. 서버가 그리는 목록(포스트·댓글)은 router.refresh 로 다시 받는다.
 * 화면이 받은 목록을 따로 들고 있는 탭(이미지·통계)은 useAdminRefresh 로 자기 다시 받기를 등록한다 —
 * router.refresh 는 그런 탭의 목록을 바꾸지 못한다.
 */
type Handler = { run: () => void; busy: boolean };
const Registry = createContext<(handler: Handler | null) => void>(() => {});
const Current = createContext<Handler | null>(null);

export function AdminRefreshProvider({ children }: { children: React.ReactNode }) {
    const [handler, setHandler] = useState<Handler | null>(null);
    return <Registry.Provider value={setHandler}><Current.Provider value={handler}>{children}</Current.Provider></Registry.Provider>;
}

export function useAdminRefresh(run: () => void, busy: boolean) {
    const register = useContext(Registry);
    useEffect(() => { register({ run, busy }); }, [register, run, busy]);
    useEffect(() => () => register(null), [register]);
}

export function AdminRefreshButton() {
    const handler = useContext(Current);
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const refreshServer = useCallback(() => startTransition(() => router.refresh()), [router]);
    const busy = pending || !!handler?.busy;
    const onClick = useMemo(() => handler?.run ?? refreshServer, [handler, refreshServer]);
    return <RefreshButton busy={busy} onClick={onClick} />;
}
