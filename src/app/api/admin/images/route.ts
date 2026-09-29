import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { HttpError, requireAdminApi } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/api";
import { deleteUnusedImages, ImageDeleteRefused, listImageLibrary } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * 고를 수 있는 이미지 목록 (관리자 전용).
 *
 * 캐시하지 않는다. 방금 올린 이미지가 목록에 없으면 그 화면의 쓸모가 없다.
 * 에디터 이미지 선택용이다. 관리 화면의 페이지 조회는 /api/admin/images/list를 쓴다.
 */
export async function GET() {
    try {
        await requireAdminApi();
        return NextResponse.json({ images: await listImageLibrary() });
    } catch (error) {
        return handleApiError(error, "api/admin/images", "이미지 목록을 불러오지 못했습니다.");
    }
}

const deleteSchema = z.object({
    paths: z.array(z.string().min(1).max(500)).min(1, "지울 이미지를 고르세요.").max(100, "한 번에 100개까지 지울 수 있습니다."),
});

/**
 * 아무 글도 쓰지 않는 이미지를 지운다 (관리자 전용).
 *
 * 쓰는 중인지는 서버가 다시 판정한다 (deleteUnusedImages). 쓰는 이미지는 지우지 않으므로
 * 어떤 페이지도 영향을 받지 않고, 캐시 무효화도 필요 없다.
 */
export async function DELETE(request: NextRequest) {
    try {
        await requireAdminApi();
        const { paths } = await parseBody(request, deleteSchema);
        try {
            return NextResponse.json(await deleteUnusedImages([...new Set(paths)]));
        } catch (error) {
            if (error instanceof ImageDeleteRefused) throw new HttpError(error.status, error.message);
            throw error;
        }
    } catch (error) {
        return handleApiError(error, "api/admin/images", "이미지를 삭제하지 못했습니다.");
    }
}
