"use client";

import { AdminWrapper, PostTable, Skeleton } from "./Admin.styled";

/**
 * 관리 화면이 데이터를 기다리는 동안 보여줄 뼈대.
 *
 * 실제 화면과 같은 자리·같은 높이로 그린다. 스피너 하나만 띄우면
 * 내용이 도착하는 순간 배치가 통째로 바뀌어 화면이 튄다.
 */

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
                            <Skeleton style={{ width: "2.6rem", height: "1.25rem", borderRadius: "999px" }} />
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

/** 화면 전체. 네비게이션 직후 loading.tsx 가 이것을 쓴다. */
export default function AdminSkeleton() {
    return (
        <AdminWrapper>
            <div className="admin-head">
                <h2>포스트 관리</h2>
                <Skeleton style={{ width: "6.5rem", height: "2.2rem" }} />
            </div>
            <StatRowSkeleton />
            <PostTableSkeleton />
        </AdminWrapper>
    );
}
