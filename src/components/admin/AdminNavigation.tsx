"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { commentListUrl, postListState, postListUrl, safeAdminReturn } from "@/lib/admin-navigation";
import styles from "./Management.module.css";

export default function AdminNavigation() {
    const pathname = usePathname();
    const params = useSearchParams();
    const tab = pathname === "/admin/ai" ? "ai" : pathname === "/admin/comments" ? "comments" : pathname === "/admin/images" ? "images" : pathname === "/admin/stats" ? "stats" : "posts";
    // 포스트 목록의 필터를 returnTo 로 들고 다니다가 "포스트" 탭으로 돌아올 때 되살린다
    const returnTo = tab === "posts" ? postListUrl(postListState(new URLSearchParams(params))) : safeAdminReturn(params.get("returnTo"));
    const current = (name: typeof tab) => (tab === name ? "page" : undefined);
    const withReturn = (path: string) => (returnTo === "/admin" ? path : `${path}?${new URLSearchParams({ returnTo })}`);
    return (
        <nav className={styles.navigation} aria-label="콘텐츠 관리">
            <Link href={returnTo} aria-current={current("posts")}>포스트</Link>
            <Link href={commentListUrl({ returnTo })} aria-current={current("comments")}>댓글</Link>
            <Link href={withReturn("/admin/images")} aria-current={current("images")}>이미지</Link>
            <Link href={tab === "stats" ? `/admin/stats${params.size ? `?${params}` : ""}` : withReturn("/admin/stats")} aria-current={current("stats")}>통계</Link>
            <Link href={withReturn("/admin/ai")} aria-current={current("ai")}>AI 활용</Link>
        </nav>
    );
}
