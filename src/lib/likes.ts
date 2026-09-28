import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/auth";
import type { LikeState, LikeTarget, PostLikes } from "@/types/like";

/** 댓글마다 조회하지 않고 개수와 내 선택을 각각 한 번에 가져온다. */
export async function getPostLikes(slug: string, userId?: string): Promise<PostLikes> {
    return prisma.$transaction(async tx => {
        const post = await tx.post.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true, authorId: true, _count: { select: { likes: true } } } });
        if (!post) throw new HttpError(404, "포스트를 찾을 수 없습니다.");
        const comments = await tx.comment.findMany({ where: { postId: post.id, deletedAt: null }, select: { id: true, authorId: true, _count: { select: { likes: true } } } });
        const selectedPost = userId ? await tx.postLike.findUnique({ where: { postId_userId: { postId: post.id, userId } } }) : null;
        const selectedComments = userId ? await tx.commentLike.findMany({ where: { userId, comment: { postId: post.id, deletedAt: null } }, select: { commentId: true } }) : [];
        const selected = new Set(selectedComments.map(row => row.commentId));
        return {
            post: { likeCount: post._count.likes, likedByMe: !!selectedPost, isMine: !!userId && post.authorId === userId },
            comments: Object.fromEntries(comments.map(row => [row.id, { likeCount: row._count.likes, likedByMe: selected.has(row.id), isMine: row.authorId === userId }])),
        };
    }, { isolationLevel: "RepeatableRead" });
}

/** 카드들이 같은 쿼리를 공유한다. 초안의 slug나 개수는 공개하지 않는다. */
export async function getPostLikeCounts() {
    const rows = await prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, _count: { select: { likes: true } } } });
    return Object.fromEntries(rows.map(row => [row.slug, row._count.likes]));
}

/** 대상 행을 잠가 같은 대상의 등록·취소와 삭제/초안 전환을 직렬화한다. 수정일은 건드리지 않는다. */
export async function setLike(target: LikeTarget, userId: string, liked: boolean): Promise<LikeState> {
    return prisma.$transaction(async tx => {
        if (target.kind === "post") {
            const [post] = await tx.$queryRaw<{ id: string; authorId: string | null; status: string }[]>`
                SELECT id, author_id AS "authorId", status FROM posts WHERE slug = ${target.slug} FOR UPDATE`;
            if (!post || post.status !== "PUBLISHED") throw new HttpError(404, "포스트를 찾을 수 없습니다.");
            if (post.authorId === userId) throw new HttpError(403, "본인이 작성한 글에는 좋아요를 누를 수 없습니다.");
            if (liked) await tx.postLike.createMany({ data: [{ postId: post.id, userId }], skipDuplicates: true });
            else await tx.postLike.deleteMany({ where: { postId: post.id, userId } });
            return { likeCount: await tx.postLike.count({ where: { postId: post.id } }), likedByMe: liked, isMine: false };
        }
        const [comment] = await tx.$queryRaw<{ id: string; postId: string; authorId: string; deletedAt: Date | null }[]>`
            SELECT id, post_id AS "postId", author_id AS "authorId", deleted_at AS "deletedAt"
            FROM comments WHERE id = ${target.id} FOR UPDATE`;
        if (!comment || comment.deletedAt) throw new HttpError(404, "댓글을 찾을 수 없습니다.");
        const [post] = await tx.$queryRaw<{ status: string }[]>`SELECT status FROM posts WHERE id = ${comment.postId} FOR SHARE`;
        if (!post || post.status !== "PUBLISHED") throw new HttpError(404, "댓글을 찾을 수 없습니다.");
        if (comment.authorId === userId) throw new HttpError(403, "본인이 작성한 댓글에는 좋아요를 누를 수 없습니다.");
        if (liked) await tx.commentLike.createMany({ data: [{ commentId: comment.id, userId }], skipDuplicates: true });
        else await tx.commentLike.deleteMany({ where: { commentId: comment.id, userId } });
        return { likeCount: await tx.commentLike.count({ where: { commentId: comment.id } }), likedByMe: liked, isMine: false };
    });
}
