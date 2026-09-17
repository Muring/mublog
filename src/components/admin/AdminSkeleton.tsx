"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AdminNavigation from "./AdminNavigation";
import Dropdown from "@/components/ui/Dropdown";
import TagChips from "@/components/ui/TagChips";
import PostTableHead from "./PostTableHead";
import PostTableToolbar from "./PostTableToolbar";
import { ChartCard } from "./VisitorChart.styled";
import { CompactList } from "./AdminCommentList";
import { CommentRow } from "@/components/comments/Comments.styled";
import styles from "./Management.module.css";
import { AdminWrapper, PostTable, TableScroll, TableToolbar, Button, Skeleton } from "./Admin.styled";

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

/** 글자 자리는 실제 행의 line-height·배지·버튼 상자가 잡고, 그 안에 로딩 막대만 넣는다. */
function TextSkeleton({ width = "4ch" }: { width?: string }) {
    return <Skeleton style={{ display: "inline-block", verticalAlign: "middle", width, maxWidth: "100%", height: "0.8em" }} />;
}

/** 실제 표와 같은 머리글·행 구조·반응형 규칙을 사용한다. */
export function PostTableSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <PostTable aria-hidden data-loading>
            <PostTableHead loading />
            <tbody>
                {Array.from({ length: rows }, (_, i) => (
                    <tr key={i}>
                        <td className="title-cell">
                            <span className="title-link"><TextSkeleton width={i % 2 ? "75%" : "60%"} /></span>
                            <span className="slug"><TextSkeleton width="45%" /></span>
                            <div className="compact-tags"><TagChips tags={["\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"]} /></div>
                            <span className="compact-comments"><TextSkeleton width="6ch" /></span>
                        </td>
                        <td data-label="상태">
                            <span className="badge"><TextSkeleton width="2ch" /></span>
                        </td>
                        <td data-label="태그"><TagChips tags={["\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"]} visibleCount={1} alignEnd /></td>
                        <td data-label="발행일"><TextSkeleton width="10ch" /></td>
                        <td data-label="수정일"><TextSkeleton width="10ch" /></td>
                        <td data-label="누적 조회" className="views-total"><TextSkeleton width="3ch" /></td>
                        <td data-label="댓글"><span className="title-link"><TextSkeleton width="2ch" /></span></td>
                        <td className="actions">
                            <div className="action-buttons">
                                <span className="row-edit"><TextSkeleton width="2em" /></span>
                                <span className="row-delete"><TextSkeleton width="2em" /></span>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </PostTable>
    );
}

/** 실제 툴바와 같은 높이·줄바꿈 규칙을 사용한다. 로딩 중에는 조작하지 않는다. */
function CommentToolbarSkeleton() {
    return (
        <TableToolbar data-loading>
            <div className="status-filters">
                {["전체", "게시 중", "삭제됨"].map((label, i) => (
                    <button key={label} type="button" tabIndex={-1} aria-pressed={i === 0}>
                        {label} <Skeleton style={{ display: "inline-block", width: "1rem", height: "0.7rem" }} />
                    </button>
                ))}
            </div>
            <Dropdown className="post-filter" label="글로 거르기" size="control" value="all" options={[{ value: "all", label: "모든 글" }]} onChange={() => {}} />
            <Dropdown label="작성자로 거르기" size="control" value="all" options={[{ value: "all", label: "모든 작성자" }]} onChange={() => {}} />
            <button type="button" tabIndex={-1} disabled>초기화</button>
        </TableToolbar>
    );
}

/** 접힌 통계 카드 → 필터 툴바 → 스크롤 표 순서를 실제 포스트 관리와 맞춘다. */
export default function AdminSkeleton() {
    return (
        <div role="status" aria-label="포스트 목록을 불러오는 중">
            <div aria-hidden inert>
                <ChartCard>
                    <summary tabIndex={-1}>
                        <span style={{ fontSize: ".9rem", fontWeight: 800 }}><TextSkeleton width="8em" /></span>
                        <span className="summary-value"><TextSkeleton width="7em" /></span>
                    </summary>
                </ChartCard>
                <PostTableToolbar loading state={{ q: "", status: "all", sort: "newest" }} counts={{ all: 0, PUBLISHED: 0, DRAFT: 0 }} onChange={() => {}} />
                <TableScroll><PostTableSkeleton /></TableScroll>
            </div>
        </div>
    );
}

/** 댓글 필터·개수 요약·28px 아바타의 압축 행·페이지 이동 자리를 유지한다. */
export function AdminCommentsSkeleton() {
    return (
        <div role="status" aria-label="댓글 목록을 불러오는 중">
            <div aria-hidden inert>
                <CommentToolbarSkeleton />
                <p className={styles.summary}><Skeleton style={{ width: "13rem", height: "1.45rem" }} /></p>
                <CompactList>
                    {Array.from({ length: 6 }, (_, i) => (
                        <li key={i}>
                            <CommentRow className="root">
                                <div className="avatar-col"><Skeleton className="avatar" style={{ borderRadius: "50%" }} /></div>
                                <div className="content">
                                    <div className="meta">
                                        <Skeleton style={{ width: "4rem", height: "1rem" }} />
                                        <Skeleton style={{ width: "3rem", height: "0.8rem" }} />
                                        <Skeleton style={{ width: "min(12rem, 40%)", height: "1rem" }} />
                                    </div>
                                    <p className="body"><Skeleton style={{ width: i % 2 ? "65%" : "85%", height: "1.4rem" }} /></p>
                                </div>
                            </CommentRow>
                        </li>
                    ))}
                </CompactList>
                <div className={styles.pagination}>
                    <span><TextSkeleton width="2em" /></span><span><TextSkeleton width="3em" /></span><span><TextSkeleton width="2em" /></span>
                </div>
            </div>
        </div>
    );
}
