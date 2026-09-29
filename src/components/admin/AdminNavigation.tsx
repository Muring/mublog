"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { commentListUrl, postListState, postListUrl, safeAdminReturn } from "@/lib/admin-navigation";
import styles from "./Management.module.css";

export default function AdminNavigation() {
    const pathname = usePathname();
    const params = useSearchParams();
    const tab = pathname === "/admin/comments" ? "comments" : pathname === "/admin/images" ? "images" : "posts";
    // 포스트 목록의 필터를 returnTo 로 들고 다니다가 "포스트 관리" 로 돌아올 때 되살린다
    const returnTo = tab === "posts" ? postListUrl(postListState(new URLSearchParams(params))) : safeAdminReturn(params.get("returnTo"));
    const current = (name: typeof tab) => (tab === name ? "page" : undefined);
    return (
        <nav className={styles.navigation} aria-label="콘텐츠 관리">
            <Link href={returnTo} aria-current={current("posts")}>포스트 관리</Link>
            <Link href={commentListUrl({ returnTo })} aria-current={current("comments")}>댓글 관리</Link>
            <Link href={returnTo === "/admin" ? "/admin/images" : `/admin/images?${new URLSearchParams({ returnTo })}`} aria-current={current("images")}>이미지 관리</Link>
        </nav>
    );
}
