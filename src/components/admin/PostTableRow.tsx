"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./Admin.styled";
import { useToast } from "@/providers/Toast";
import { formatCardDate } from "@/lib/date";
import { fetchJson } from "@/lib/fetcher";
import { useConfirm } from "@/providers/Confirm";
import Sparkline from "./Sparkline";

type Props = {
    post: {
        id: string;
        slug: string;
        title: string;
        tags: string[];
        status: "DRAFT" | "PUBLISHED";
        publishedAt: string | null;
        updatedAt: string;
        viewCount: number;
        commentCount: number;
        viewTrend: number[];
    };
    trendBucketDays: number;
};

const TREND_POINTS = 20;

export default function PostTableRow({ post, trendBucketDays }: Props) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    async function remove() {
        const ok = await confirm({
            title: `"${post.title}" 을(를) 삭제할까요?`,
            description: "댓글도 함께 삭제되며 되돌릴 수 없습니다.",
            confirmLabel: "삭제",
            danger: true,
        });
        if (!ok) return;

        setIsDeleting(true);
        try {
            await fetchJson(`/api/admin/posts/${post.id}`, { method: "DELETE" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
            setIsDeleting(false);
            return;
        }
        toast.success(`"${post.title}" 을(를) 삭제했습니다.`);
        startTransition(() => router.refresh());
    }

    const busy = isDeleting || isPending;

    return (
        <tr style={busy ? { opacity: 0.5 } : undefined}>
            {/* data-label 은 좁은 화면에서 행이 카드로 바뀔 때 각 값 앞에 붙는 이름표다 */}
            <td className="title-cell">
                {/*
                  초안은 공개 주소가 없다(공개 사이트에서 404). 그래서 공개글은 글로,
                  초안은 편집 화면으로 보낸다 — 어느 쪽이든 "그 글" 로 가는 것이 목적이다.
                */}
                <Link
                    href={post.status === "PUBLISHED" ? `/${post.slug}` : `/admin/posts/${post.id}`}
                    className="title-link"
                >
                    {post.title}
                </Link>
                <span className="slug">/{post.slug}</span>
            </td>
            <td data-label="상태">
                <span className={`badge ${post.status === "PUBLISHED" ? "published" : "draft"}`}>
                    {post.status === "PUBLISHED" ? "공개" : "초안"}
                </span>
            </td>
            <td data-label="태그">{post.tags.join(", ") || "-"}</td>
            {/* 초안은 발행된 적이 없다. 만든 날로 메우지 않고 비운 채로 둔다 */}
            <td data-label="발행일">
                {post.publishedAt ? formatCardDate(post.publishedAt) : "-"}
            </td>
            <td data-label="수정일">{formatCardDate(post.updatedAt)}</td>
            {/*
              숫자는 발행 후 누적 조회수, 선은 기록 시작일부터 오늘까지의 추이(전체 글이 같은 구간·칸).
              데이터가 없어도 같은 자리를 지킨다 — 선은 바닥에 흐리게, 숫자 자리는 폭을 고정한다.
            */}
            <td data-label="조회">
                <span
                    className="views-cell"
                    title={`마지막 칸(${trendBucketDays}일) ${post.viewTrend.at(-1) ?? 0}회`}
                >
                    <span className="views-total">{post.viewCount}</span>
                    <Sparkline values={post.viewTrend.length ? post.viewTrend : new Array(TREND_POINTS).fill(0)} />
                </span>
            </td>
            {/* 댓글이 있으면 그 글의 댓글만 걸러 보는 관리 화면으로 */}
            <td data-label="댓글">
                {post.commentCount > 0 ? (
                    <Link href={`/admin/comments?post=${post.slug}`} className="title-link">
                        {post.commentCount}
                    </Link>
                ) : (
                    post.commentCount
                )}
            </td>
            <td className="actions">
                <div className="action-buttons">
                    <Link href={`/admin/posts/${post.id}`}>
                        <Button as="span">수정</Button>
                    </Link>
                    <Button className="danger" onClick={remove} disabled={busy}>
                        {busy ? "삭제 중..." : "삭제"}
                    </Button>
                </div>
            </td>
        </tr>
    );
}
