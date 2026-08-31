import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/auth";
import type { CommentNode } from "@/types/comment";

type CommentRow = {
    id: string;
    parentId: string | null;
    body: string;
    createdAt: Date;
    editedAt: Date | null;
    deletedAt: Date | null;
    author: { id: string; username: string; avatarUrl: string | null };
};

/** 삭제된 댓글의 본문과 작성자는 응답에 담지 않는다. */
function toNode(row: CommentRow): CommentNode {
    const deleted = row.deletedAt !== null;
    return {
        id: row.id,
        parentId: row.parentId,
        body: deleted ? null : row.body,
        author: deleted ? null : row.author,
        createdAt: row.createdAt.toISOString(),
        editedAt: row.editedAt?.toISOString() ?? null,
        deleted,
    };
}

export async function getCommentsByPostSlug(slug: string): Promise<CommentNode[]> {
    const post = await prisma.post.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: { id: true },
    });
    if (!post) throw new HttpError(404, "포스트를 찾을 수 없습니다.");

    const rows = await prisma.comment.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            parentId: true,
            body: true,
            createdAt: true,
            editedAt: true,
            deletedAt: true,
            author: { select: { id: true, username: true, avatarUrl: true } },
        },
    });

    return rows.map(toNode);
}

/**
 * 도배 방지.
 *
 * 인메모리 카운터는 서버리스 인스턴스마다 따로 놀아서 소용이 없고,
 * 개인 블로그에 Upstash 같은 외부 의존을 더하고 싶지도 않다.
 * @@index([authorId, createdAt]) 가 이미 있어서 이 조회는 밀리초 수준이다.
 */
async function assertNotFlooding(authorId: string, body: string) {
    const now = Date.now();
    const [lastMinute, lastHour, previous] = await Promise.all([
        prisma.comment.count({
            where: { authorId, createdAt: { gt: new Date(now - 60_000) } },
        }),
        prisma.comment.count({
            where: { authorId, createdAt: { gt: new Date(now - 3_600_000) } },
        }),
        prisma.comment.findFirst({
            where: { authorId, deletedAt: null },
            orderBy: { createdAt: "desc" },
            select: { body: true },
        }),
    ]);

    if (lastMinute >= 3) throw new HttpError(429, "잠시 후 다시 시도해 주세요.");
    if (lastHour >= 20) throw new HttpError(429, "한 시간에 20개까지 작성할 수 있습니다.");
    if (previous?.body === body) throw new HttpError(429, "직전 댓글과 내용이 같습니다.");
}

export async function createComment(params: {
    slug: string;
    authorId: string;
    body: string;
    parentId?: string | null;
}): Promise<CommentNode> {
    const { slug, authorId, body, parentId } = params;

    const post = await prisma.post.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: { id: true },
    });
    if (!post) throw new HttpError(404, "포스트를 찾을 수 없습니다.");

    if (parentId) {
        const parent = await prisma.comment.findUnique({
            where: { id: parentId },
            select: { postId: true, parentId: true, deletedAt: true },
        });
        if (!parent || parent.postId !== post.id) {
            throw new HttpError(400, "답글을 달 댓글을 찾을 수 없습니다.");
        }
        if (parent.deletedAt) throw new HttpError(400, "삭제된 댓글에는 답글을 달 수 없습니다.");
        // 컬럼은 임의 깊이를 허용하지만 UI 는 2단만 그린다.
        // 답글의 답글을 막아 트리가 항상 정확히 2단이 되게 한다.
        if (parent.parentId) throw new HttpError(400, "답글에는 답글을 달 수 없습니다.");
    }

    await assertNotFlooding(authorId, body);

    // 카운트가 어긋나지 않도록 삽입과 증가를 한 트랜잭션으로 묶는다
    const [created] = await prisma.$transaction([
        prisma.comment.create({
            data: { postId: post.id, authorId, body, parentId: parentId ?? null },
            select: {
                id: true,
                parentId: true,
                body: true,
                createdAt: true,
                editedAt: true,
                deletedAt: true,
                author: { select: { id: true, username: true, avatarUrl: true } },
            },
        }),
        prisma.post.update({
            where: { id: post.id },
            data: { commentCount: { increment: 1 } },
        }),
    ]);

    return toNode(created);
}

export async function updateComment(params: {
    id: string;
    actorId: string;
    body: string;
}): Promise<CommentNode> {
    const { id, actorId, body } = params;

    const existing = await prisma.comment.findUnique({
        where: { id },
        select: { authorId: true, deletedAt: true },
    });
    if (!existing || existing.deletedAt) throw new HttpError(404, "댓글을 찾을 수 없습니다.");
    // 수정은 작성자 본인만 가능하다. 관리자도 남의 글을 고칠 수는 없다.
    if (existing.authorId !== actorId) throw new HttpError(403, "본인 댓글만 수정할 수 있습니다.");

    const updated = await prisma.comment.update({
        where: { id },
        data: { body, editedAt: new Date() },
        select: {
            id: true,
            parentId: true,
            body: true,
            createdAt: true,
            editedAt: true,
            deletedAt: true,
            author: { select: { id: true, username: true, avatarUrl: true } },
        },
    });

    return toNode(updated);
}

export async function deleteComment(params: {
    id: string;
    actorId: string;
    isAdmin: boolean;
}): Promise<void> {
    const { id, actorId, isAdmin } = params;

    const existing = await prisma.comment.findUnique({
        where: { id },
        select: { authorId: true, postId: true, deletedAt: true },
    });
    if (!existing || existing.deletedAt) throw new HttpError(404, "댓글을 찾을 수 없습니다.");
    // 삭제는 작성자 본인 또는 관리자
    if (existing.authorId !== actorId && !isAdmin) {
        throw new HttpError(403, "삭제 권한이 없습니다.");
    }

    // hard delete 하면 달려 있던 답글이 함께 사라진다.
    // 행은 남기고 본문만 가려서 대화 흐름을 유지한다.
    await prisma.$transaction([
        prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } }),
        prisma.post.update({
            where: { id: existing.postId },
            data: { commentCount: { decrement: 1 } },
        }),
    ]);
}
