"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthWrapper } from "./HeaderAuth.styled";
import { fetchJson } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/Skeleton.styled";

export type Me = {
    user: { id: string; username: string; avatarUrl: string | null } | null;
    isAdmin: boolean;
};

export function fetchMe(): Promise<Me> {
    return fetchJson<Me>("/api/me");
}

export default function HeaderAuth() {
    const pathname = usePathname();
    const { data, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: fetchMe,
        staleTime: 60_000,
    });

    // 자리만 비워두면 헤더 오른쪽이 한동안 텅 비었다가 갑자기 채워진다.
    // 아바타·이름·버튼과 같은 모양을 미리 깔아 둔다 (실제 216x31).
    if (isLoading) {
        return (
            <AuthWrapper aria-hidden>
                <Skeleton style={{ width: 26, height: 26, borderRadius: "50%" }} />
                <Skeleton style={{ width: 47, height: 14 }} />
                <Skeleton style={{ width: 48, height: 31 }} />
                <Skeleton style={{ width: 72, height: 31 }} />
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

    return (
        <AuthWrapper>
            {/* Vercel 이미지 최적화 한도를 아끼려고 next/image 대신 img 를 쓴다 */}
            {data.user.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    className="avatar"
                    src={data.user.avatarUrl}
                    alt=""
                    width={26}
                    height={26}
                />
            )}
            <span className="name">{data.user.username}</span>

            {data.isAdmin && (
                <Link href="/admin" className="auth-action">
                    관리
                </Link>
            )}

            {/* GET 로그아웃은 img 태그만으로도 트리거되므로 POST 폼으로 처리한다 */}
            <form action="/auth/signout" method="post">
                <button type="submit" className="auth-action">
                    로그아웃
                </button>
            </form>
        </AuthWrapper>
    );
}
