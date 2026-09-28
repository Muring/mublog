export type LikeState = {
    likeCount: number;
    likedByMe: boolean;
    isMine: boolean;
};

/** 개인 상태가 포함되므로 공유 HTTP 캐시에 저장하지 않는다. */
export type PostLikes = {
    post: LikeState;
    comments: Record<string, LikeState>;
};
export type LikeTarget = { kind: "post"; slug: string } | { kind: "comment"; id: string };
