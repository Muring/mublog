"use client";

import Link from "next/link";
import { AdminWrapper, PostTable, Button, Skeleton } from "./Admin.styled";

/**
 * 관리 화면의 뼈대.
 *
 * loading.tsx 와 page.tsx 가 **같은 컴포넌트**를 쓴다.
 * 둘이 조금이라도 다르면 loading -> page 로 넘어갈 때 화면이 한 번 더 튄다.
 * 실제로 헤더를 한쪽은 스켈레톤, 한쪽은 진짜 버튼으로 그렸다가 깜빡임을 만들었다.
 */

/** 데이터가 필요 없는 부분. 기다리는 동안에도 눌러서 글을 쓰러 갈 수 있다. */
export function AdminShell({ children }: { children: React.ReactNode }) {
    return (
        <AdminWrapper>
            <div className="admin-head">
                <h2>포스트 관리</h2>
                <Link href="/admin/posts/new">
                    <Button as="span" className="primary">
                        새 글 쓰기
                    </Button>
                </Link>
            </div>
            {children}
        </AdminWrapper>
    );
}

/** 통계 4칸 */
export function StatRowSkeleton() {
    return (
        <div className="stat-row" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
                <div className="stat" key={i}>
                    <Skeleton style={{ width: "2.5rem", height: "0.75rem" }} />
                    <Skeleton style={{ width: "3rem", height: "1.5rem", marginTop: "0.4rem" }} />
                </div>
            ))}
        </div>
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
        <AdminShell>
            <StatRowSkeleton />
            <PostTableSkeleton />
        </AdminShell>
    );
}
