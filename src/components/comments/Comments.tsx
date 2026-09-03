"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CommentsWrapper, CommentList, SignInPrompt } from "./Comments.styled";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { useToast } from "@/providers/Toast";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { fetchJson, jsonRequest } from "@/lib/fetcher";
import { commentsUrl, fetchComments, fetchMe, queryKeys } from "@/lib/queries";
import type { CommentNode } from "@/types/comment";

export default function Comments({ slug }: { slug: string }) {
    const pathname = usePathname();
    const toast = useToast();
    const queryKey = queryKeys.comments(slug);

    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const { data: me } = useQuery({ queryKey: queryKeys.me, queryFn: fetchMe });
    const {
        data: comments = [],
        isLoading,
        isError,
    } = useQuery({ queryKey, queryFn: () => fetchComments(slug) });

    const create = useOptimisticList<CommentNode, { body: string; parentId: string | null }, CommentNode>({
        queryKey,
        mutationFn: (input) => fetchJson<CommentNode>(commentsUrl(slug), jsonRequest("POST", input)),
        onStart: () => setFormError(null),
        // 로그인 정보가 아직 없으면 작성자를 그릴 수 없으므로 목록을 그대로 둔다.
        // 응답이 오면 onSettled 의 invalidate 가 채운다.
        apply: (list, input) =>
            me?.user
                ? [
                      ...list,
                      {
                          id: `temp-${crypto.randomUUID()}`,
                          parentId: input.parentId,
                          body: input.body,
                          author: me.user,
                          createdAt: new Date().toISOString(),
                          editedAt: null,
                          deleted: false,
                          pending: true,
                      },
                  ]
                : list,
        onError: (message) => setFormError(message),
        onSuccess: () => setReplyTo(null),
    });

    const update = useOptimisticList<CommentNode, { id: string; body: string }, CommentNode>({
        queryKey,
        mutationFn: (input) =>
            fetchJson<CommentNode>(`/api/comments/${input.id}`, jsonRequest("PATCH", { body: input.body })),
        apply: (list, { id, body }) =>
            list.map((c) => (c.id === id ? { ...c, body, pending: true } : c)),
        onError: (message) => toast.error(message),
    });

    const remove = useOptimisticList<CommentNode, string, { ok: true }>({
        queryKey,
        mutationFn: (id) => fetchJson<{ ok: true }>(`/api/comments/${id}`, { method: "DELETE" }),
        // 답글이 고아가 되지 않도록 행은 남기고 본문과 작성자만 지운다
        // 낙관적 갱신에서도 "관리자가 지웠는가" 를 함께 채운다.
        // 안 채우면 서버 응답이 오는 순간 문구가 바뀌어 깜빡인다.
        apply: (list, id) =>
            list.map((c) =>
                c.id === id
                    ? {
                          ...c,
                          deleted: true,
                          body: null,
                          deletedByAdmin: c.author?.id !== me?.user?.id,
                          author: null,
                      }
                    : c
            ),
        onError: (message) => toast.error(message),
    });

    // 서버는 평평한 배열을 주고 여기서 2단으로 묶는다
    const roots = comments.filter((c) => c.parentId === null);
    const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

    // 삭제된 댓글은 개수에서 뺀다
    const visibleCount = comments.filter((c) => !c.deleted).length;
    const isMutating = create.isPending || update.isPending || remove.isPending;

    return (
        <CommentsWrapper>
            <div className="comments-title">
                <h4>댓글</h4>
                <span className="count">{visibleCount}</span>
            </div>

            {me?.user ? (
                <CommentForm
                    submitLabel="등록"
                    isPending={create.isPending && replyTo === null}
                    error={replyTo === null ? formError : null}
                    onSubmit={(body) => create.mutate({ body, parentId: null })}
                />
            ) : (
                <SignInPrompt>
                    <p>GitHub 계정으로 로그인하면 댓글을 남길 수 있습니다.</p>
                    <Link href={`/login?next=${encodeURIComponent(pathname)}`}>로그인</Link>
                </SignInPrompt>
            )}

            {isLoading ? (
                <p className="status-text">댓글을 불러오는 중...</p>
            ) : isError ? (
                <p className="status-text">댓글을 불러오지 못했습니다.</p>
            ) : roots.length === 0 ? (
                <p className="status-text">첫 댓글을 남겨보세요.</p>
            ) : (
                <CommentList>
                    {roots.map((comment) => {
                        const replies = repliesOf(comment.id);
                        const isOpen = replyTo === comment.id;
                        // 답글 입력창이 열려 있으면 그 아래로도 줄기가 이어져야 한다
                        const showThread = replies.length > 0 || isOpen;

                        return (
                            <li key={comment.id}>
                                <CommentItem
                                    comment={comment}
                                    currentUserId={me?.user?.id ?? null}
                                    isAdmin={me?.isAdmin ?? false}
                                    isReplying={isOpen}
                                    isMutating={isMutating}
                                    canReply
                                    hasReplies={showThread}
                                    onReplyToggle={setReplyTo}
                                    onEdit={(id, body) => update.mutate({ id, body })}
                                    onDelete={(id) => remove.mutate(id)}
                                />

                                {showThread && (
                                    <div className="replies">
                                        {replies.map((reply, index) => (
                                            <CommentItem
                                                key={reply.id}
                                                comment={reply}
                                                currentUserId={me?.user?.id ?? null}
                                                isAdmin={me?.isAdmin ?? false}
                                                isReplying={false}
                                                isMutating={isMutating}
                                                canReply={false}
                                                isReply
                                                hasNext={index < replies.length - 1 || isOpen}
                                                onReplyToggle={setReplyTo}
                                                onEdit={(id, body) => update.mutate({ id, body })}
                                                onDelete={(id) => remove.mutate(id)}
                                            />
                                        ))}

                                        {isOpen && (
                                            <CommentForm
                                                submitLabel="답글 등록"
                                                placeholder="답글을 남겨보세요."
                                                isPending={create.isPending}
                                                error={formError}
                                                autoFocus
                                                onSubmit={(body) =>
                                                    create.mutate({ body, parentId: comment.id })
                                                }
                                                onCancel={() => setReplyTo(null)}
                                            />
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </CommentList>
            )}
        </CommentsWrapper>
    );
}
