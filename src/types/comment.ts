export type CommentAuthor = {
    id: string;
    username: string;
    avatarUrl: string | null;
};

/**
 * 클라이언트로 내려가는 댓글.
 *
 * 삭제된 댓글은 답글이 고아가 되지 않도록 행을 남기지만,
 * 본문과 작성자는 내려보내지 않는다.
 */
export type CommentNode = {
    id: string;
    parentId: string | null;
    body: string | null;
    author: CommentAuthor | null;
    createdAt: string;
    editedAt: string | null;
    deleted: boolean;
    /** 낙관적 갱신으로 화면에만 먼저 올라간 항목 */
    pending?: boolean;
};
