import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { handleApiError, PRIVATE_NO_STORE } from "@/lib/api";
import { getPostLikes } from "@/lib/likes";
import { changeLike } from "@/lib/like-api";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
    try {
        const { slug } = await params;
        const profile = await getProfile();
        return NextResponse.json(await getPostLikes(slug, profile?.id), { headers: PRIVATE_NO_STORE });
    } catch (error) {
        const response = handleApiError(error, "post likes GET", "좋아요를 불러오지 못했습니다.");
        response.headers.set("Cache-Control", PRIVATE_NO_STORE["Cache-Control"]);
        return response;
    }
}
export async function PUT(request: Request, { params }: Params) {
    return changeLike(request, { kind: "post", slug: (await params).slug }, true);
}
export async function DELETE(request: Request, { params }: Params) {
    return changeLike(request, { kind: "post", slug: (await params).slug }, false);
}
