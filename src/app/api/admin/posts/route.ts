import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/api";
import { postInputSchema } from "@/lib/validation";
import { renderMarkdown } from "@/lib/markdown/render";
import { estimateReadingTime } from "@/lib/reading-time";
import { revalidatePost } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/** 포스트 생성 (관리자 전용) */
export async function POST(request: NextRequest) {
    try {
        const profile = await requireAdminApi();
        const input = await parseBody(request, postInputSchema);

        const existing = await prisma.post.findUnique({ where: { slug: input.slug } });
        if (existing) {
            return NextResponse.json({ error: "이미 사용 중인 slug 입니다." }, { status: 409 });
        }

        const post = await prisma.post.create({
            data: {
                slug: input.slug,
                title: input.title,
                description: input.description ?? null,
                tags: input.tags,
                thumbnail: input.thumbnail ?? null,
                contentMd: input.contentMd,
                contentHtml: await renderMarkdown(input.contentMd),
                status: input.status,
                publishedAt:
                    input.status === "PUBLISHED"
                        ? (input.publishedAt ? new Date(input.publishedAt) : new Date())
                        : (input.publishedAt ? new Date(input.publishedAt) : null),
                readingTime: estimateReadingTime(input.contentMd),
                authorId: profile.id,
            },
        });

        if (post.status === "PUBLISHED") revalidatePost(post.slug);

        return NextResponse.json(
            {
                id: post.id,
                slug: post.slug,
                publishedAt: post.publishedAt?.toISOString() ?? null,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleApiError(error, "api/admin/posts POST");
    }
}
