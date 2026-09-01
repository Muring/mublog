"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentsWrapper, CommentList, SignInPrompt } from "./Comments.styled";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { fetchMe } from "@/components/layout/HeaderAuth";
import { useToast } from "@/providers/Toast";
import { fetchJson, jsonRequest } from "@/lib/fetcher";
import type { CommentNode } from "@/types/comment";

const commentsUrl = (slug: string) => `/api/posts/${encodeURIComponent(slug)}/comments`;

function fetchComments(slug: string): Promise<CommentNode[]> {
    return fetchJson<CommentNode[]>(commentsUrl(slug));
}

export default function Comments({ slug }: { slug: string }) {
    const pathname = usePathname();
    const toast = useToast();
    const queryClient = useQueryClient();
    const queryKey = ["comments", slug];

    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
    const {
        data: comments = [],
        isLoading,
        isError,
    } = useQuery({ queryKey, queryFn: () => fetchComments(slug) });

    const create = useMutation({
        mutationFn: (input: { body: string; parentId: string | null }) =>
            fetchJson<CommentNode>(commentsUrl(slug), jsonRequest("POST", input)),
        // 응답을 기다리지 않고 화면에 먼저 올린다.
        // 실패하면 onError 에서 스냅샷으로 되돌린다.
        onMutate: async (input) => {
            setFormError(null);
            await queryClient.cancelQueries({ queryKey });
            const snapshot = queryClient.getQueryData<CommentNode[]>(queryKey) ?? [];

            if (me?.user) {
                const optimistic: CommentNode = {
                    id: `temp-${crypto.randomUUID()}`,
                    parentId: input.parentId,
                    body: input.body,
                    author: me.user,
                    createdAt: new Date().toISOString(),
                    editedAt: null,
                    deleted: false,
                    pending: true,
                };
                queryClient.setQueryData<CommentNode[]>(queryKey, [...snapshot, optimistic]);
            }
            return { snapshot };
        },
        onError: (error, _input, context) => {
            if (context) queryClient.setQueryData(queryKey, context.snapshot);
            setFormError(error.message);
        },
        onSuccess: () => setReplyTo(null),
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });

    const update = useMutation({
        mutationFn: (input: { id: string; body: string }) =>
            fetchJson<CommentNode>(
                `/api/comments/${input.id}`,
                jsonRequest("PATCH", { body: input.body })
            ),
        onMutate: async ({ id, body }) => {
            await queryClient.cancelQueries({ queryKey });
            const snapshot = queryClient.getQueryData<CommentNode[]>(queryKey) ?? [];
            queryClient.setQueryData<CommentNode[]>(
                queryKey,
                snapshot.map((c) => (c.id === id ? { ...c, body, pending: true } : c))
            );
            return { snapshot };
        },
        onError: (error, _input, context) => {
            if (context) queryClient.setQueryData(queryKey, context.snapshot);
            toast.error(error.message);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });

    const remove = useMutation({
        mutationFn: (id: string) =>
            fetchJson<{ ok: true }>(`/api/comments/${id}`, { method: "DELETE" }),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey });
            const snapshot = queryClient.getQueryData<CommentNode[]>(queryKey) ?? [];
            queryClient.setQueryData<CommentNode[]>(
                queryKey,
                snapshot.map((c) =>
                    c.id === id ? { ...c, deleted: true, body: null, author: null } : c
                )
            );
            return { snapshot };
        },
        onError: (error, _id, context) => {
            if (context) queryClient.setQueryData(queryKey, context.snapshot);
            toast.error(error.message);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
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
