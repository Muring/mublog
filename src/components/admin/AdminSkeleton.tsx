"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AdminNavigation from "./AdminNavigation";
import Dropdown from "@/components/ui/Dropdown";
import TagChips from "@/components/ui/TagChips";
import PostTableHead from "./PostTableHead";
import PostTableToolbar from "./PostTableToolbar";
import { CompactList } from "./AdminCommentList";
import { CommentRow } from "@/components/comments/Comments.styled";
import { ImageCard } from "./ImagePicker.styled";
import { DetailPanel, ImagesLayout } from "./AdminImages.styled";
import FilterBar from "./FilterBar";
import { SkeletonText } from "@/components/ui/Skeleton.styled";
import styles from "./Management.module.css";
import { AdminWrapper, PostTable, AdminListScroll, ResultBar, Button, Skeleton } from "./Admin.styled";

/** 관리 탭 사이에서 유지되는 공통 프레임. 페이지 로딩은 children 내부만 교체한다. */
export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // 제목은 모든 탭에 공통이다. 어느 탭인지는 바로 아래 탭 줄이 말한다 — 탭마다 "○○ 관리" 를 붙이면 좁은 폭에서 줄이 꺾인다
    return (
        <AdminWrapper data-ai={pathname === "/admin/ai" ? true : undefined}>
            <div className="admin-head">
                <h2>블로그 관리</h2>
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
                            <span className="compact-likes"><TextSkeleton width="6ch" /></span>
                        </td>
                        <td data-label="상태">
                            <span className="badge"><TextSkeleton width="2ch" /></span>
                        </td>
                        <td data-label="태그"><TagChips tags={["\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"]} visibleCount={1} alignEnd /></td>
                        <td data-label="발행일"><TextSkeleton width="10ch" /></td>
                        <td data-label="수정일"><TextSkeleton width="10ch" /></td>
                        <td data-label="누적 조회" className="views-total"><TextSkeleton width="3ch" /></td>
                        <td data-label="댓글"><span className="title-link"><TextSkeleton width="2ch" /></span></td>
                        <td data-label="좋아요"><TextSkeleton width="2ch" /></td>
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

/** 로딩 중에도 세 관리 화면 공용 FilterBar 를 그대로 써서 자리·폭이 실제와 같다. 조작하지 않는다. */
function ToolbarSkeleton({ statuses }: { statuses: string[] }) {
    return (
        <FilterBar
            loading
            status={
                <div className="status-filters">
                    {statuses.map((label, i) => (
                        <button key={label} type="button" tabIndex={-1} aria-pressed={i === 0}>{label}<span className="filter-count">00</span></button>
                    ))}
                </div>
            }
            sort={<Dropdown className="sort-control" label="정렬" size="control" variant="ghost" value="newest" options={[{ value: "newest", label: "최신순" }]} onChange={() => {}} />}
            search={<input type="search" tabIndex={-1} readOnly placeholder="검색" aria-label="검색" />}
            fields={[]}
            values={{}}
            fieldCount={0}
            onApply={() => {}}
            summary="불러오는 중"
        />
    );
}

function CommentToolbarSkeleton() {
    return <ToolbarSkeleton statuses={["전체", "게시 중", "삭제됨"]} />;
}

/** 필터 툴바 → 스크롤 표 순서를 실제 포스트 관리와 맞춘다. */
export default function AdminSkeleton() {
    return (
        <div role="status" aria-label="포스트 목록을 불러오는 중">
            <div aria-hidden inert>
                <PostTableToolbar loading state={{ q: "", status: "all", sort: "newest", tag: "", series: "" }} counts={{ all: 0, PUBLISHED: 0, DRAFT: 0 }} onChange={() => {}} />
                <AdminListScroll><PostTableSkeleton /></AdminListScroll>
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
                <AdminListScroll>
                    <CompactList>
                        {Array.from({ length: 6 }, (_, i) => (
                            <li key={i}>
                                <CommentRow className="root">
                                    <div className="avatar-col"><Skeleton className="avatar" style={{ borderRadius: "50%" }} /></div>
                                    <div className="content">
                                        <div className="meta">
                                            <Skeleton style={{ width: "4rem", height: "1rem" }} />
                                            <Skeleton style={{ width: "3rem", height: "0.8rem" }} />
                                            <Skeleton style={{ width: "3.5rem", height: "0.8rem" }} />
                                            <Skeleton style={{ width: "min(12rem, 40%)", height: "1rem" }} />
                                            <button type="button" className="row-action" disabled><TextSkeleton width="2ch" /></button>
                                        </div>
                                        <p className="body"><Skeleton style={{ width: i % 2 ? "65%" : "85%", height: "1.4rem" }} /></p>
                                    </div>
                                </CommentRow>
                            </li>
                        ))}
                    </CompactList>
                </AdminListScroll>
                <div className={styles.pagination}>
                    <span><TextSkeleton width="2em" /></span><span><TextSkeleton width="3em" /></span><span><TextSkeleton width="2em" /></span>
                </div>
            </div>
        </div>
    );
}

/** 상태 필터·글 필터·카드 그리드·상세 패널 자리를 실제 이미지 관리와 맞춘다. */
export function AdminImagesSkeleton() {
    return (
        <div role="status" aria-label="이미지 목록을 불러오는 중">
            <div aria-hidden inert>
                <ToolbarSkeleton
                    statuses={["전체", "썸네일", "본문", "미사용", "삭제 예정"]}
                />
                <ResultBar>
                    <p>
                        <SkeletonText>총 용량 00.0MB</SkeletonText>
                        <span className="cleanup-note"><SkeletonText>다음 자동 정리 00/00 00~00시 사이 (KST). 미사용 이미지는 업로드 하루 후 정리됩니다.</SkeletonText></span>
                    </p>
                    <Button as="span" style={{ marginLeft: "auto" }}><SkeletonText style={{ lineHeight: "inherit" }}>삭제 예정 0개 지금 삭제</SkeletonText></Button>
                </ResultBar>
                <ImagesLayout>
                    <AdminListScroll>
                        <div className="grid">
                            {Array.from({ length: 12 }, (_, i) => (
                                <ImageCard key={i} as="span">
                                    <Skeleton style={{ width: "100%", aspectRatio: "16 / 9", height: "auto" }} />
                                    <span className="name"><TextSkeleton width="80%" /></span>
                                    <span className="meta"><TextSkeleton width="50%" /></span>
                                </ImageCard>
                            ))}
                        </div>
                    </AdminListScroll>
                    <DetailPanel className="inline-panel"><p className="placeholder"><SkeletonText>이미지를 선택하세요.</SkeletonText></p></DetailPanel>
                </ImagesLayout>
            </div>
        </div>
    );
}
