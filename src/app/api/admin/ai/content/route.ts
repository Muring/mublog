import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdminApi, HttpError } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { publicationSchema } from "@/lib/ai-usage";
export async function POST(request: NextRequest) {
    try {
        await requireAdminApi();
        if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) throw new HttpError(403, "요청 출처 오류");
        const { id: requestedId, ...data } = await parseBody(request, publicationSchema);
        const id = data.kind === "intro" ? "intro" : requestedId;
        if (data.kind !== "intro" && id === "intro") throw new HttpError(400, "소개 항목의 종류는 바꿀 수 없습니다.");
        if (data.postId && !await prisma.post.findFirst({ where: { id: data.postId, status: "PUBLISHED" }, select: { id: true } })) throw new HttpError(400, "발행된 글만 연결할 수 있습니다.");
        const entry = id ? await prisma.aiPublication.upsert({ where: { id }, create: { id, ...data }, update: data }) : await prisma.aiPublication.create({ data });
        revalidateTag("ai-public", { expire: 0 });
        return NextResponse.json({ id: entry.id });
    } catch (error) { return handleApiError(error, "admin-ai-content"); }
}
