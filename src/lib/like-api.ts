import { NextResponse } from "next/server";
import { requireUserApi, HttpError } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { overLimit } from "@/lib/rate-limit";
import { setLike } from "@/lib/likes";
import type { LikeTarget } from "@/types/like";

export const privateLikeHeaders = { "Cache-Control": "private, no-store" };

export async function changeLike(request: Request, target: LikeTarget, liked: boolean) {
    try {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) throw new HttpError(403, "허용되지 않은 요청입니다.");
        const profile = await requireUserApi();
        if (overLimit(`like:${profile.id}`, 60, 60_000)) throw new HttpError(429, "잠시 후 다시 시도해 주세요.");
        return NextResponse.json(await setLike(target, profile.id, liked), { headers: privateLikeHeaders });
    } catch (error) {
        const response = handleApiError(error, "likes mutation", "좋아요를 변경하지 못했습니다.");
        response.headers.set("Cache-Control", "private, no-store");
        return response;
    }
}
