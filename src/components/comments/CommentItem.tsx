"use client";

import { useState } from "react";
import { CommentRow } from "./Comments.styled";
import CommentBody from "./CommentBody";
import CommentForm from "./CommentForm";
import { useConfirm } from "@/providers/Confirm";
import type { CommentNode } from "@/types/comment";

function formatWhen(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "방금";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return new Date(iso).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

type Props = {
    comment: CommentNode;
    currentUserId: string | null;
    isAdmin: boolean;
    isReplying: boolean;
    isMutating: boolean;
    onReplyToggle: (id: string | null) => void;
    onEdit: (id: string, body: string) => void;
    onDelete: (id: string) => void;
    /** 답글은 다시 답글을 달 수 없다 (트리를 2단으로 유지) */
    canReply: boolean;
    /** 이 댓글이 답글인가 */
    isReply?: boolean;
    /** 아래로 줄기를 이어야 하는가 (답글이 달렸거나, 뒤에 형제 답글이 있음) */
    hasReplies?: boolean;
    hasNext?: boolean;
};

export default function CommentItem({
    comment,
    currentUserId,
    isAdmin,
    isReplying,
    isMutating,
    onReplyToggle,
    onEdit,
    onDelete,
    canReply,
    isReply = false,
    hasReplies = false,
    hasNext = false,
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const confirm = useConfirm();

    const rowClass = [
        isReply ? "reply" : "root",
        hasReplies ? "has-replies" : "",
        hasNext ? "has-next" : "",
        comment.pending ? "pending" : "",
    ]
        .filter(Boolean)
        .join(" ");

    if (comment.deleted) {
        return (
            <CommentRow className={rowClass}>
                <div className="avatar-col">
                    <div className="avatar avatar-fallback">-</div>
                </div>
                <div className="content">
                    <p className="body deleted">삭제된 댓글입니다.</p>
                </div>
            </CommentRow>
        );
    }

    const isMine = currentUserId !== null && comment.author?.id === currentUserId;
    const canDelete = isMine || isAdmin;

    return (
        <CommentRow className={rowClass}>
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
                    {isMine && <span className="badge">나</span>}
                    <span className="time">
                        {formatWhen(comment.createdAt)}
                        {comment.editedAt && " (수정됨)"}
                    </span>
                </div>

                {isEditing ? (
                    <CommentForm
                        initialValue={comment.body ?? ""}
                        submitLabel="수정"
                        isPending={isMutating}
                        autoFocus
                        onSubmit={(body) => {
                            onEdit(comment.id, body);
                            setIsEditing(false);
                        }}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <>
                        <p className="body">
                            <CommentBody text={comment.body ?? ""} />
                        </p>

                        {!comment.pending && (
                            <div className="row-actions">
                                {canReply && currentUserId && (
                                    <button
                                        type="button"
                                        className="row-action"
                                        onClick={() => onReplyToggle(isReplying ? null : comment.id)}
                                    >
                                        {isReplying ? "답글 취소" : "답글"}
                                    </button>
                                )}
                                {isMine && (
                                    <button
                                        type="button"
                                        className="row-action"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        수정
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        type="button"
                                        className="row-action danger"
                                        disabled={isMutating}
                                        onClick={async () => {
                                            const ok = await confirm({
                                                title: "이 댓글을 삭제할까요?",
                                                description:
                                                    "달린 답글은 남고, 이 댓글은 삭제된 표시로 바뀝니다.",
                                                confirmLabel: "삭제",
                                                danger: true,
                                            });
                                            if (ok) onDelete(comment.id);
                                        }}
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </CommentRow>
    );
}
