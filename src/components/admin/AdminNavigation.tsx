"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { commentListUrl, postListState, postListUrl, rememberedListUrl, rememberListUrl, safeAdminReturn } from "@/lib/admin-navigation";
import styles from "./Management.module.css";

const TAB_PATHS = { posts: "/admin", comments: "/admin/comments", images: "/admin/images", stats: "/admin/stats" } as const;
type Tab = keyof typeof TAB_PATHS;
const noSubscribe = () => () => {};
/** 탭마다 기억한 주소. 문자열로 돌려 같은 값이면 다시 그리지 않는다. 서버에는 기억이 없으므로 빈 값이다 */
const readMemory = () => JSON.stringify(Object.fromEntries(Object.entries(TAB_PATHS).map(([tab, path]) => [tab, rememberedListUrl(path)])));

export default function AdminNavigation() {
    const pathname = usePathname();
    const params = useSearchParams();
    const tab: Tab = pathname === "/admin/comments" ? "comments" : pathname === "/admin/images" ? "images" : pathname === "/admin/stats" ? "stats" : "posts";
    const current = (name: Tab) => (tab === name ? "page" : undefined);
    // 지금 탭의 주소(조건 포함)를 기억해 두었다가, 다른 탭에서 이 탭으로 돌아올 때 그 주소로 연다
    const here = `${pathname}${params.size ? `?${params}` : ""}`;
    useEffect(() => { rememberListUrl(TAB_PATHS[tab], here); }, [tab, here]);
    const memory = JSON.parse(useSyncExternalStore(noSubscribe, readMemory, () => "{}")) as Partial<Record<Tab, string | null>>;
    // 기억이 없을 때: 포스트 목록의 필터는 returnTo 로 들고 다니던 기존 방식으로 되살린다
    const returnTo = tab === "posts" ? postListUrl(postListState(new URLSearchParams(params))) : safeAdminReturn(params.get("returnTo"));
    const withReturn = (path: string) => (returnTo === "/admin" ? path : `${path}?${new URLSearchParams({ returnTo })}`);
    const href = (name: Tab, fallback: string) => (tab === name ? here : memory[name] ?? fallback);
    return (
        <nav className={styles.navigation} aria-label="콘텐츠 관리">
            <Link href={href("posts", returnTo)} aria-current={current("posts")}>포스트</Link>
            <Link href={href("comments", commentListUrl({ returnTo }))} aria-current={current("comments")}>댓글</Link>
            <Link href={href("images", withReturn("/admin/images"))} aria-current={current("images")}>이미지</Link>
            <Link href={href("stats", withReturn("/admin/stats"))} aria-current={current("stats")}>통계</Link>
        </nav>
    );
}
