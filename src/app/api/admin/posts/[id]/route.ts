import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { postPatchSchema } from "@/lib/validation";
import { renderMarkdown } from "@/lib/markdown/render";
import { estimateReadingTime } from "@/lib/reading-time";
import { revalidatePost } from "@/lib/revalidate";
import type { Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** 포스트 수정 (관리자 전용) */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        await requireAdminApi();
        const { id } = await params;

        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "포스트를 찾을 수 없습니다." }, { status: 404 });
        }

        const parsed = postPatchSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "잘못된 입력입니다." },
                { status: 400 }
            );
        }
        const input = parsed.data;

        if (input.slug && input.slug !== existing.slug) {
            const taken = await prisma.post.findUnique({ where: { slug: input.slug } });
            if (taken) {
                return NextResponse.json({ error: "이미 사용 중인 slug 입니다." }, { status: 409 });
            }
        }

        const data: Prisma.PostUpdateInput = {};
        if (input.slug !== undefined) data.slug = input.slug;
        if (input.title !== undefined) data.title = input.title;
        if (input.description !== undefined) data.description = input.description ?? null;
        if (input.tags !== undefined) data.tags = input.tags;
        if (input.thumbnail !== undefined) data.thumbnail = input.thumbnail ?? null;
        if (input.status !== undefined) data.status = input.status;
        if (input.publishedAt !== undefined) {
            data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
        }
        if (input.contentMd !== undefined) {
            data.contentMd = input.contentMd;
            data.contentHtml = await renderMarkdown(input.contentMd);
            data.readingTime = estimateReadingTime(input.contentMd);
        }

        // 초안을 처음 발행할 때 발행일이 비어 있으면 지금으로 채운다
        if (input.status === "PUBLISHED" && !existing.publishedAt && !input.publishedAt) {
            data.publishedAt = new Date();
        }

        const post = await prisma.post.update({ where: { id }, data });

        // 발행 상태에서 벗어난 경우에도 옛 페이지를 걷어내야 하므로
        // 이전/현재 어느 쪽이든 공개였다면 무효화한다.
        if (post.status === "PUBLISHED" || existing.status === "PUBLISHED") {
            revalidatePost(post.slug, existing.slug);
        }

        return NextResponse.json({
            id: post.id,
            slug: post.slug,
            status: post.status,
            publishedAt: post.publishedAt?.toISOString() ?? null,
        });
    } catch (error) {
        return handleApiError(error, "api/admin/posts/[id] PATCH");
    }
}

/** 포스트 삭제 (관리자 전용) */
export async function DELETE(_request: NextRequest, { params }: Params) {
    try {
        await requireAdminApi();
        const { id } = await params;

        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "포스트를 찾을 수 없습니다." }, { status: 404 });
        }

        // 댓글은 스키마의 onDelete: Cascade 로 함께 정리된다
        await prisma.post.delete({ where: { id } });

        if (existing.status === "PUBLISHED") revalidatePost(existing.slug);

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleApiError(error, "api/admin/posts/[id] DELETE");
    }
}
