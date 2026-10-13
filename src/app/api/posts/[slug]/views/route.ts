import { NextResponse, type NextRequest } from "next/server";
import { getPostViews } from "@/lib/stats";
import { handleApiError } from "@/lib/api";

// 조회수는 계속 바뀌므로 캐시하지 않는다.
// 포스트 페이지 자체는 정적으로 두고 이 값만 클라이언트가 따로 가져간다.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        return NextResponse.json({ views: (await getPostViews(slug)) ?? 0 });
    } catch (error) {
        return handleApiError(error, "api/posts/[slug]/views");
    }
}
