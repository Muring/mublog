import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { slugSchema } from "@/lib/validation";

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

        const existing = await prisma.post.findUnique({
            where: { slug: parsed.data },
            select: { id: true },
        });

        const taken = Boolean(existing) && existing?.id !== excludeId;
        return NextResponse.json({
            available: !taken,
            reason: taken ? "이미 사용 중인 slug 입니다." : null,
        });
    } catch (error) {
        return handleApiError(error, "api/admin/slug-check");
    }
}
