import { NextResponse, type NextRequest } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/api";
import { commentInputSchema } from "@/lib/validation";
import { createComment, getCommentsByPostSlug } from "@/lib/comments";
import { revalidatePost } from "@/lib/revalidate";

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

        const input = await parseBody(request, commentInputSchema);

        const comment = await createComment({
            slug,
            authorId: profile.id,
            body: input.body,
            parentId: input.parentId,
        });

        // 카드에 보이는 댓글 수는 목록 캐시(posts:list)에서 온다.
        // 여기서 지우지 않으면 DB 는 올랐는데 화면은 최대 1시간 동안 옛 숫자를 보여준다.
        revalidatePost(slug);

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        return handleApiError(error, "api/posts/[slug]/comments POST");
    }
}
