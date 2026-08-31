import { NextResponse, type NextRequest } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { commentInputSchema } from "@/lib/validation";
import { createComment, getCommentsByPostSlug } from "@/lib/comments";

// 사용자별로 다르고 낙관적 갱신과 충돌하므로 캐시하지 않는다
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/** 댓글 목록 (공개) */
export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        return NextResponse.json(await getCommentsByPostSlug(slug));
    } catch (error) {
        return handleApiError(error, "api/posts/[slug]/comments GET");
    }
}

/** 댓글 작성 (로그인 필요, 권한 등급 무관) */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        const profile = await requireUserApi();

        const parsed = commentInputSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "잘못된 입력입니다." },
                { status: 400 }
            );
        }

        const comment = await createComment({
            slug,
            authorId: profile.id,
            body: parsed.data.body,
            parentId: parsed.data.parentId,
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        return handleApiError(error, "api/posts/[slug]/comments POST");
    }
}
