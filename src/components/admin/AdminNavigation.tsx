"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { commentListUrl, postListState, postListUrl, safeAdminReturn } from "@/lib/admin-navigation";
import styles from "./Management.module.css";

export default function AdminNavigation() {
    const pathname = usePathname();
    const params = useSearchParams();
    const comments = pathname === "/admin/comments";
    const returnTo = comments ? safeAdminReturn(params.get("returnTo")) : postListUrl(postListState(new URLSearchParams(params)));
    return (
        <nav className={styles.navigation} aria-label="콘텐츠 관리">
            <Link href={returnTo} aria-current={!comments ? "page" : undefined}>포스트 관리</Link>
            <Link href={commentListUrl({ returnTo })} aria-current={comments ? "page" : undefined}>댓글 관리</Link>
        </nav>
    );
}
