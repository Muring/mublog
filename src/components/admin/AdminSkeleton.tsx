"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AdminNavigation from "./AdminNavigation";
import { AdminWrapper, PostTable, Button, Skeleton } from "./Admin.styled";

/** 관리 탭 사이에서 유지되는 공통 프레임. 페이지 로딩은 children 내부만 교체한다. */
export function AdminShell({ children }: { children: React.ReactNode }) {
    const title = usePathname() === "/admin/comments" ? "댓글 관리" : "포스트 관리";
    return (
        <AdminWrapper>
            <div className="admin-head">
                <h2>{title}</h2>
                <Link href="/admin/posts/new">
                    <Button as="span" className="primary">
                        새 글 쓰기
                    </Button>
                </Link>
            </div>
            <Suspense fallback={<div style={{ height: 45 }} />}><AdminNavigation /></Suspense>
            {children}
        </AdminWrapper>
    );
}

/** 표 본문. 실제 행 높이(58px)와 맞춰 도착 시 흔들리지 않게 한다. */
export function PostTableSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <PostTable aria-hidden>
            <thead>
                <tr>
                    <th>제목</th>
                    <th>상태</th>
                    <th>태그</th>
                    <th>발행일</th>
                    <th>수정일</th>
                    <th>누적 조회</th>
                    <th>댓글</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }, (_, i) => (
                    <tr key={i}>
                        <td className="title-cell">
                            <Skeleton style={{ width: "60%", height: "0.9rem" }} />
                            <Skeleton
                                style={{ width: "40%", height: "0.7rem", marginTop: "0.35rem" }}
                            />
                        </td>
                        <td data-label="상태">
                            <Skeleton
                                style={{ width: "2.6rem", height: "1.25rem", borderRadius: "999px" }}
                            />
                        </td>
                        <td data-label="태그">
                            <Skeleton style={{ width: "70%", height: "0.8rem" }} />
                        </td>
                        <td data-label="발행일">
                            <Skeleton style={{ width: "5.5rem", height: "0.8rem" }} />
                        </td>
                        <td data-label="수정일">
                            <Skeleton style={{ width: "5.5rem", height: "0.8rem" }} />
                        </td>
                        <td data-label="누적 조회">
                            <Skeleton style={{ width: "2rem", height: "1.1rem" }} />
                        </td>
                        <td data-label="댓글">
                            <Skeleton style={{ width: "1rem", height: "0.8rem" }} />
                        </td>
                        <td className="actions">
                            <div className="action-buttons">
                                <Skeleton style={{ width: "3.2rem", height: "2rem" }} />
                                <Skeleton style={{ width: "3.2rem", height: "2rem" }} />
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </PostTable>
    );
}

/** 목록이 오기 전 상태 그대로. loading.tsx 가 이것을 쓴다. */
export default function AdminSkeleton() {
    return (
        <>
            <Skeleton style={{ height: "3.2rem", marginBottom: "1.5rem" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }} aria-hidden>
                {[0, 1, 2].map((key) => <Skeleton key={key} style={{ width: "4.5rem", height: "2.4rem" }} />)}
            </div>
            <Skeleton style={{ width: "65%", height: "2.5rem", marginBottom: 16 }} />
            <PostTableSkeleton />
        </>
    );
}
