"use client";

import { useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { fetchJson } from "@/lib/fetcher";
import { fetchMe, postLikesUrl, queryKeys, type Me } from "@/lib/queries";
import { useToast } from "@/providers/Toast";
import type { LikeState, PostLikes } from "@/types/like";

/** 본문과 모든 댓글이 조회 하나를 공유한다. 갱신·복구는 대상 한 건에만 적용한다. */
export function useLike(slug: string, commentId?: string) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const toast = useToast();
    const lock = useRef(false);
    const me = useQuery({ queryKey: queryKeys.me, queryFn: fetchMe, refetchOnWindowFocus: true });
    const userId = me.data?.user?.id ?? null;
    const key = queryKeys.likes(slug, userId);
    const mutationKey = ["like-change", slug, userId];
    const likes = useQuery({
        queryKey: key,
        queryFn: ({ signal }) => fetchJson<PostLikes>(postLikesUrl(slug), { signal, cache: "no-store" }),
        enabled: me.data !== undefined && !me.isFetching,
        refetchOnWindowFocus: true,
    });
    const state = commentId ? likes.data?.comments[commentId] : likes.data?.post;
    const sameUser = () => (queryClient.getQueryData<Me>(queryKeys.me)?.user?.id ?? null) === userId;
    const patch = (value: LikeState) => queryClient.setQueryData<PostLikes>(key, previous => previous && (commentId
        ? { ...previous, comments: { ...previous.comments, [commentId]: value } }
        : { ...previous, post: value }));
    const mutation = useMutation<LikeState, Error, boolean, { previous: LikeState }>({
        mutationKey,
        mutationFn: liked => fetchJson<LikeState>(commentId ? `/api/comments/${encodeURIComponent(commentId)}/likes` : postLikesUrl(slug), { method: liked ? "PUT" : "DELETE" }),
        onMutate: async liked => {
            await queryClient.cancelQueries({ queryKey: key });
            const current = queryClient.getQueryData<PostLikes>(key);
            const previous = (commentId ? current?.comments[commentId] : current?.post) ?? state!;
            patch({ ...previous, likedByMe: liked, likeCount: Math.max(0, previous.likeCount + (liked ? 1 : -1)) });
            return { previous };
        },
        onError: (error, _liked, context) => {
            if (context && sameUser()) patch(context.previous);
            toast.error(error.message);
        },
        onSuccess: value => {
            if (!sameUser()) return;
            patch(value);
            if (!commentId) queryClient.setQueryData<Record<string, number>>(queryKeys.postLikeCounts, previous => ({ ...previous, [slug]: value.likeCount }));
        },
        onSettled: async () => {
            lock.current = false;
            // 다른 댓글이 갱신 중이면 마지막 요청이 끝난 뒤 한 번만 재조회한다.
            if (sameUser() && queryClient.isMutating({ mutationKey }) === 1) {
                await queryClient.invalidateQueries({ queryKey: key });
            }
            if (!commentId) await queryClient.invalidateQueries({ queryKey: queryKeys.postLikeCounts });
        },
    });
    function toggle() {
        if (lock.current || mutation.isPending || me.isFetching) return;
        if (!me.data?.user) {
            const hash = commentId ? `#comment-${commentId}` : "#post-likes";
            router.push(`/login?next=${encodeURIComponent(pathname + hash)}`);
            return;
        }
        if (!state || state.isMine) return;
        lock.current = true;
        mutation.mutate(!state.likedByMe);
    }
    return {
        state, toggle, pending: mutation.isPending,
        loading: me.isPending || me.isFetching || likes.isPending,
        error: me.isError || likes.isError,
        retry: () => { void me.refetch(); void likes.refetch(); },
    };
}
