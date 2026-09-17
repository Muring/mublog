"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TagChips from "@/components/ui/TagChips";
import { useToast } from "@/providers/Toast";
import { formatCardDate } from "@/lib/date";
import { fetchJson } from "@/lib/fetcher";
import { useConfirm } from "@/providers/Confirm";

import { commentListUrl } from "@/lib/admin-navigation";

type Props = {
    returnTo: string;
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
    };
};

export default function PostTableRow({ post, returnTo }: Props) {
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

    const commentsHref = commentListUrl({ post: post.slug, returnTo });
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
                <div className="compact-tags"><TagChips tags={post.tags} /></div>
                <Link href={commentsHref} className="compact-comments">댓글 {post.commentCount}개</Link>
            </td>
            <td data-label="상태">
                <span className={`badge ${post.status === "PUBLISHED" ? "published" : "draft"}`}>
                    {post.status === "PUBLISHED" ? "공개" : "초안"}
                </span>
            </td>
            <td data-label="태그">{post.tags.length ? <TagChips tags={post.tags} visibleCount={1} alignEnd /> : "-"}</td>
            {/* 초안은 발행된 적이 없다. 만든 날로 메우지 않고 비운 채로 둔다 */}
            <td data-label="발행일">
                {post.publishedAt ? formatCardDate(post.publishedAt) : "-"}
            </td>
            <td data-label="수정일">{formatCardDate(post.updatedAt)}</td>
            <td data-label="누적 조회" className="views-total">
                {post.viewCount.toLocaleString("ko-KR")}
            </td>
            <td data-label="댓글">
                <Link href={commentsHref} className="title-link" aria-label={`댓글 ${post.commentCount}개 관리`}>{post.commentCount}</Link>
            </td>
            <td className="actions">
                <div className="action-buttons">
                    <Link href={`/admin/posts/${post.id}`} className="row-edit">
                        수정
                    </Link>
                    <button type="button" className="row-delete" onClick={remove} disabled={busy}>
                        {busy ? "삭제 중..." : "삭제"}
                    </button>
                </div>
            </td>
        </tr>
    );
}
