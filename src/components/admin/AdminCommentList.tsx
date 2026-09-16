"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommentList, CommentRow } from "@/components/comments/Comments.styled";
import CommentBody from "@/components/comments/CommentBody";
import { useConfirm } from "@/providers/Confirm";
import { useToast } from "@/providers/Toast";
import { fetchJson } from "@/lib/fetcher";
import { formatRelative } from "@/lib/date";
import type { AdminComment } from "@/lib/comments";

/**
 * 관리 화면의 댓글 목록.
 *
 * 공개 화면의 CommentRow · CommentBody 를 그대로 쓴다 — 아바타·이름·시각·본문 규칙이
 * 두 화면에서 갈리면 안 된다. 여기서 더 붙는 건 "어느 글에 달렸나" 링크와 삭제뿐이다.
 * 답글 트리는 그리지 않는다. 최신순 한 줄 목록이라 부모 표시는 배지로 대신한다.
 */
export default function AdminCommentList({ comments }: { comments: AdminComment[] }) {
    if (comments.length === 0) return null;
    return (
        <CommentList>
            {comments.map((comment) => (
                <li key={comment.id}>
                    <AdminCommentRow comment={comment} />
                </li>
            ))}
        </CommentList>
    );
}

function AdminCommentRow({ comment }: { comment: AdminComment }) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    async function remove() {
        const ok = await confirm({
            title: "이 댓글을 삭제할까요?",
            description: "본문이 가려지고 되돌릴 수 없습니다. 답글은 남습니다.",
            confirmLabel: "삭제",
            danger: true,
        });
        if (!ok) return;
        setIsDeleting(true);
        try {
            await fetchJson(`/api/comments/${comment.id}`, { method: "DELETE" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
            setIsDeleting(false);
            return;
        }
        toast.success("댓글을 삭제했습니다.");
        startTransition(() => router.refresh());
    }

    const busy = isDeleting || isPending;
    const postLink = (
        <Link href={`/${comment.post.slug}#comments`} className="row-action">
            {comment.post.title}
        </Link>
    );

    if (comment.deleted) {
        return (
            <CommentRow className="root">
                <div className="avatar-col">
                    <div className="avatar avatar-fallback">-</div>
                </div>
                <div className="content">
                    <div className="meta">
                        <span className="time">{formatRelative(comment.createdAt)}</span>
                        {comment.parentId && <span className="badge">답글</span>}
                    </div>
                    <p className="body deleted">
                        {comment.deletedByAdmin ? "관리자에 의해 삭제된 댓글입니다." : "삭제된 댓글입니다."}
                    </p>
                    <div className="row-actions">{postLink}</div>
                </div>
            </CommentRow>
        );
    }

    return (
        <CommentRow className={busy ? "root pending" : "root"}>
            <div className="avatar-col">
                {comment.author?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="avatar" src={comment.author.avatarUrl} alt="" />
                ) : (
                    <div className="avatar avatar-fallback">
                        {comment.author?.username.slice(0, 1).toUpperCase() ?? "?"}
                    </div>
                )}
            </div>
            <div className="content">
                <div className="meta">
                    <span className="username">{comment.author?.username}</span>
                    {comment.parentId && <span className="badge">답글</span>}
                    <span className="time">
                        {formatRelative(comment.createdAt)}
                        {comment.editedAt && " (수정됨)"}
                    </span>
                </div>
                <p className="body">
                    <CommentBody text={comment.body ?? ""} />
                </p>
                <div className="row-actions">
                    {postLink}
                    <button type="button" className="row-action danger" onClick={remove} disabled={busy}>
                        {busy ? "삭제 중..." : "삭제"}
                    </button>
                </div>
            </div>
        </CommentRow>
    );
}
