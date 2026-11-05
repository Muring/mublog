"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthWrapper } from "./HeaderAuth.styled";
import { Skeleton } from "@/components/ui/Skeleton.styled";
import { fetchMe, queryKeys } from "@/lib/queries";
import { strokeIcon } from "@/components/ui/icon";

export default function HeaderAuth() {
    const pathname = usePathname();
    // staleTime 은 providers/Query.tsx 의 기본값(60초)을 그대로 쓴다
    const { data, isLoading } = useQuery({ queryKey: queryKeys.me, queryFn: fetchMe });

    // 자리만 비워두면 헤더 오른쪽이 한동안 텅 비었다가 갑자기 채워진다.
    // 계정 메뉴 버튼(아바타 + 이름)과 같은 모양을 미리 깔아 둔다. 이름은 좁은 화면에서 숨는 것까지 같다
    if (isLoading) {
        return (
            <AuthWrapper aria-hidden>
                <span className="account-trigger">
                    <Skeleton style={{ width: 26, height: 26, borderRadius: "50%" }} />
                    <Skeleton className="name" style={{ width: 47, height: 14 }} />
                </span>
            </AuthWrapper>
        );
    }

    if (!data?.user) {
        // 로그인 페이지에서 또 로그인 버튼을 보여줄 필요는 없다
        if (pathname === "/login") return <AuthWrapper />;

        return (
            <AuthWrapper>
                <Link
                    href={`/login?next=${encodeURIComponent(pathname)}`}
                    className="auth-action"
                >
                    로그인
                </Link>
            </AuthWrapper>
        );
    }

    return <AccountMenu user={data.user} isAdmin={data.isAdmin} />;
}

/**
 * 로그인한 사용자의 메뉴. 아바타(+이름)를 누르면 관리 · AI 관리 · 로그아웃이 펼쳐진다.
 * 버튼 셋을 헤더에 늘어놓으면 320px 에서 헤더가 화면 밖으로 52px 넘쳐 모바일 브라우저가 페이지 전체를 축소해 보였다.
 * 폭에 따라 모양을 바꾸지 않고 모든 폭에서 같은 메뉴를 쓴다(이름만 좁은 화면에서 숨긴다).
 */
function AccountMenu({ user, isAdmin }: { user: { username: string; avatarUrl?: string | null }; isAdmin: boolean }) {
    const pathname = usePathname();
    // 연 화면의 주소를 들고 있다가 주소가 바뀌면(다른 화면으로 가면) 저절로 닫힌 것으로 본다
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const open = openedAt === pathname;
    const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const menuId = useId();
    const items = () => [...(root.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];

    useEffect(() => {
        if (!open) return;
        const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpenedAt(null); };
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, [open]);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); trigger.current?.focus(); return; }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        if (!open) { setOpen(true); requestAnimationFrame(() => items()[event.key === "ArrowUp" || event.key === "End" ? items().length - 1 : 0]?.focus()); return; }
        const list = items(), at = list.indexOf(document.activeElement as HTMLElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? list.length - 1 : (at + (event.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
        list[next]?.focus();
    };

    return (
        <AuthWrapper ref={root} onKeyDown={onKeyDown}>
            <button ref={trigger} type="button" className="account-trigger" aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} aria-label={`${user.username} 계정 메뉴`} onClick={() => setOpen(!open)}>
                {/* Vercel 이미지 최적화 한도를 아끼려고 next/image 대신 img 를 쓴다 */}
                {user.avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img className="avatar" src={user.avatarUrl} alt="" width={26} height={26} />
                    : <span className="avatar avatar-empty" aria-hidden><svg {...strokeIcon(16, 1.8)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg></span>}
                <span className="name">{user.username}</span>
            </button>
            {open && (
                <div id={menuId} className="account-menu" role="menu" aria-label="계정">
                    {isAdmin && <>
                        <Link href="/admin" role="menuitem" className="account-item" onClick={() => setOpen(false)}>관리</Link>
                        <Link href="/ai/manage" role="menuitem" className="account-item" onClick={() => setOpen(false)}>AI 관리</Link>
                        <hr aria-hidden />
                    </>}
                    {/* GET 로그아웃은 img 태그만으로도 트리거되므로 POST 폼으로 처리한다 */}
                    <form action="/auth/signout" method="post">
                        <button type="submit" role="menuitem" className="account-item">로그아웃</button>
                    </form>
                </div>
            )}
        </AuthWrapper>
    );
}
