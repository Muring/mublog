import { NextResponse, type NextRequest } from "next/server";
import { requireUserApi, getProfile } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { parseBody } from "@/lib/api";
import { commentInputSchema } from "@/lib/validation";
import { deleteComment, updateComment } from "@/lib/comments";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** 댓글 수정 (작성자 본인만) */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const profile = await requireUserApi();

        const input = await parseBody(request, commentInputSchema);

        const comment = await updateComment({
            id,
            actorId: profile.id,
            body: input.body,
        });

        return NextResponse.json(comment);
    } catch (error) {
        return handleApiError(error, "api/comments/[id] PATCH");
    }
}

/** 댓글 삭제 (작성자 본인 또는 관리자) */
export async function DELETE(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const profile = await requireUserApi();

        await deleteComment({
            id,
            actorId: profile.id,
            isAdmin: (await getProfile())?.role === "ADMIN",
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleApiError(error, "api/comments/[id] DELETE");
    }
}
