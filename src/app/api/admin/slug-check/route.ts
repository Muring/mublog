import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { slugSchema } from "@/lib/validation";
import { isSlugTaken, SLUG_TAKEN_MESSAGE } from "@/lib/post-write";

export const dynamic = "force-dynamic";

/** 에디터에서 slug 중복/형식을 실시간 확인한다 */
export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug") ?? "";
        const excludeId = searchParams.get("excludeId");

        const parsed = slugSchema.safeParse(slug);
        if (!parsed.success) {
            return NextResponse.json({
                available: false,
                reason: parsed.error.issues[0]?.message ?? "사용할 수 없는 slug 입니다.",
            });
        }

        const taken = await isSlugTaken(parsed.data, excludeId);
        return NextResponse.json({
            available: !taken,
            reason: taken ? SLUG_TAKEN_MESSAGE : null,
        });
    } catch (error) {
        return handleApiError(error, "api/admin/slug-check");
    }
}
